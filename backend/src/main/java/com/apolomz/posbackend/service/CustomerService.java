package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.CustomerRequestDTO;
import com.apolomz.posbackend.dto.response.CustomerResponseDTO;
import com.apolomz.posbackend.model.Customer;
import com.apolomz.posbackend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Page<CustomerResponseDTO> findAll(String search, Pageable pageable) {
        return customerRepository.searchCustomers(search, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponseDTO findById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponseDTO create(CustomerRequestDTO dto) {
        if (dto.getDocumentNumber() != null && !dto.getDocumentNumber().isBlank()) {
            customerRepository.findByDocumentNumber(dto.getDocumentNumber()).ifPresent(c -> {
                throw new RuntimeException("Ya existe un cliente registrado con ese documento");
            });
        }

        Customer customer = Customer.builder()
                .name(dto.getName())
                .documentNumber(dto.getDocumentNumber())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .isActive(true)
                .build();

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponseDTO update(Long id, CustomerRequestDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        customer.setName(dto.getName());
        customer.setDocumentNumber(dto.getDocumentNumber());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional
    public void toggleStatus(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        customer.setIsActive(!customer.getIsActive());
        customerRepository.save(customer);
    }

    private CustomerResponseDTO mapToResponse(Customer customer) {
        BigDecimal totalSpent = customerRepository.getTotalSpentByCustomerId(customer.getId());
        Long totalSales = customerRepository.getSalesCountByCustomerId(customer.getId());

        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .documentNumber(customer.getDocumentNumber())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .isActive(customer.getIsActive())
                .totalSpent(totalSpent)
                .totalSales(totalSales)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}