package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.SaleRequestDTO;
import com.apolomz.posbackend.dto.response.SaleResponseDTO;
import com.apolomz.posbackend.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleResponseDTO> createSale(
            @Valid @RequestBody SaleRequestDTO requestDTO,
            Authentication authentication) {

        String username = authentication.getName();
        SaleResponseDTO response = saleService.createSale(requestDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<SaleResponseDTO>> getAllSales() {
        return ResponseEntity.ok(saleService.findAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.findSaleById(id));
    }
}