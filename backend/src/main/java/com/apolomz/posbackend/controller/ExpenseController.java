package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.ExpenseRequestDTO;
import com.apolomz.posbackend.dto.response.ExpenseResponseDTO;
import com.apolomz.posbackend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/expenses", "/api/expenses"})
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> createExpense(
            @Valid @RequestBody ExpenseRequestDTO dto,
            Authentication authentication) {
        String username = authentication.getName();
        ExpenseResponseDTO response = expenseService.createExpense(username, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/current")
    public ResponseEntity<List<ExpenseResponseDTO>> getExpensesForActiveShift(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(expenseService.getExpensesForActiveShift(username));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponseDTO>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }
}
