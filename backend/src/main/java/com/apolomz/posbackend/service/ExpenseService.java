package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.ExpenseRequestDTO;
import com.apolomz.posbackend.dto.response.ExpenseResponseDTO;
import com.apolomz.posbackend.exception.BadRequestException;
import com.apolomz.posbackend.exception.ResourceNotFoundException;
import com.apolomz.posbackend.model.CashShift;
import com.apolomz.posbackend.model.Expense;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.repository.CashShiftRepository;
import com.apolomz.posbackend.repository.ExpenseRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CashShiftRepository shiftRepository;
    private final UserRepository userRepository;

    @Transactional
    public ExpenseResponseDTO createExpense(String username, ExpenseRequestDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        CashShift activeShift = shiftRepository.findByUserIdAndStatus(user.getId(), "OPEN")
                .orElseGet(() -> shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")
                        .orElseThrow(() -> new BadRequestException("No hay un turno de caja abierto para registrar egresos.")));

        Expense expense = Expense.builder()
                .shift(activeShift)
                .category(dto.getCategory().toUpperCase())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .registeredBy(user.getFullName())
                .build();

        Expense saved = expenseRepository.save(expense);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponseDTO> getExpensesForActiveShift(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        CashShift activeShift = shiftRepository.findByUserIdAndStatus(user.getId(), "OPEN")
                .orElseGet(() -> shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN").orElse(null));

        if (activeShift == null) {
            return List.of();
        }

        return expenseRepository.findByShiftIdOrderByCreatedAtDesc(activeShift.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponseDTO> getAllExpenses() {
        return expenseRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private ExpenseResponseDTO mapToDTO(Expense expense) {
        return ExpenseResponseDTO.builder()
                .id(expense.getId())
                .shiftId(expense.getShift().getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .registeredBy(expense.getRegisteredBy())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
