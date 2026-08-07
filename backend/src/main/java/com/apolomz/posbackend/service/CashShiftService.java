package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.CloseShiftRequestDTO;
import com.apolomz.posbackend.dto.request.OpenShiftRequestDTO;
import com.apolomz.posbackend.dto.response.CashShiftResponseDTO;
import com.apolomz.posbackend.exception.BadRequestException;
import com.apolomz.posbackend.exception.ResourceNotFoundException;
import com.apolomz.posbackend.model.CashShift;
import com.apolomz.posbackend.model.Sale;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.model.enums.PaymentMethod;
import com.apolomz.posbackend.repository.CashShiftRepository;
import com.apolomz.posbackend.repository.ExpenseRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CashShiftService {

    private final CashShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_CLOSED = "CLOSED";

    @Transactional
    public CashShiftResponseDTO openShift(String username, OpenShiftRequestDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        Optional<CashShift> existingOpenShift = shiftRepository.findByUserIdAndStatus(user.getId(), STATUS_OPEN);
        if (existingOpenShift.isPresent()) {
            throw new BadRequestException("Ya tienes un turno de caja abierto.");
        }

        CashShift shift = CashShift.builder()
                .user(user)
                .openedAt(LocalDateTime.now())
                .initialBase(dto.getInitialBase())
                .status(STATUS_OPEN)
                .build();

        CashShift saved = shiftRepository.save(shift);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public CashShiftResponseDTO getActiveShift(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        CashShift shift = shiftRepository.findByUserIdAndStatus(user.getId(), STATUS_OPEN)
                .orElseGet(() -> shiftRepository.findFirstByStatusOrderByOpenedAtDesc(STATUS_OPEN)
                        .orElse(null));

        if (shift == null) {
            return null;
        }

        return mapToDTO(shift);
    }

    @Transactional(readOnly = true)
    public boolean hasOpenShift(Long userId) {
        return shiftRepository.findByUserIdAndStatus(userId, STATUS_OPEN).isPresent()
                || shiftRepository.findFirstByStatusOrderByOpenedAtDesc(STATUS_OPEN).isPresent();
    }

    @Transactional
    public CashShiftResponseDTO closeShift(Long shiftId, String username, CloseShiftRequestDTO dto) {
        CashShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Turno de caja no encontrado con ID: " + shiftId));

        if (STATUS_CLOSED.equals(shift.getStatus())) {
            throw new BadRequestException("Este turno de caja ya se encuentra cerrado.");
        }

        LocalDateTime closeTime = LocalDateTime.now();

        // 1. Obtener ventas en efectivo realizadas durante el turno
        List<Sale> salesInShift = saleRepository.findByCreatedAtBetweenAndStatus(shift.getOpenedAt(), closeTime, "COMPLETED");
        BigDecimal cashSalesTotal = salesInShift.stream()
                .filter(s -> PaymentMethod.CASH.equals(s.getPaymentMethod()))
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Obtener egresos registrados durante el turno
        BigDecimal totalExpenses = expenseRepository.sumAmountByShiftId(shift.getId());
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        // 3. Fórmula estricta de Arqueo de Caja:
        // Expected = Base Inicial + Ventas Efectivo - Egresos
        BigDecimal expectedFinalAmount = shift.getInitialBase()
                .add(cashSalesTotal)
                .subtract(totalExpenses);

        shift.setClosedAt(closeTime);
        shift.setExpectedFinalAmount(expectedFinalAmount);
        shift.setActualFinalAmount(dto.getActualFinalAmount());
        shift.setStatus(STATUS_CLOSED);
        shift.setNotes(dto.getNotes());

        CashShift saved = shiftRepository.save(shift);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<CashShiftResponseDTO> getAllShifts() {
        return shiftRepository.findAllByOrderByOpenedAtDesc().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public CashShiftResponseDTO mapToDTO(CashShift shift) {
        LocalDateTime nowOrClosed = shift.getClosedAt() != null ? shift.getClosedAt() : LocalDateTime.now();

        List<Sale> salesInShift = saleRepository.findByCreatedAtBetweenAndStatus(shift.getOpenedAt(), nowOrClosed, "COMPLETED");
        BigDecimal cashSalesTotal = salesInShift.stream()
                .filter(s -> PaymentMethod.CASH.equals(s.getPaymentMethod()))
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.sumAmountByShiftId(shift.getId());
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        BigDecimal expected = shift.getInitialBase().add(cashSalesTotal).subtract(totalExpenses);
        BigDecimal actual = shift.getActualFinalAmount() != null ? shift.getActualFinalAmount() : expected;
        BigDecimal difference = actual.subtract(expected);

        return CashShiftResponseDTO.builder()
                .id(shift.getId())
                .userId(shift.getUser().getId())
                .username(shift.getUser().getUsername())
                .userFullName(shift.getUser().getFullName())
                .openedAt(shift.getOpenedAt())
                .closedAt(shift.getClosedAt())
                .initialBase(shift.getInitialBase())
                .cashSalesTotal(cashSalesTotal)
                .totalExpenses(totalExpenses)
                .expectedFinalAmount(shift.getStatus().equals(STATUS_CLOSED) ? shift.getExpectedFinalAmount() : expected)
                .actualFinalAmount(shift.getActualFinalAmount())
                .difference(shift.getStatus().equals(STATUS_CLOSED) ? difference : BigDecimal.ZERO)
                .status(shift.getStatus())
                .notes(shift.getNotes())
                .build();
    }
}
