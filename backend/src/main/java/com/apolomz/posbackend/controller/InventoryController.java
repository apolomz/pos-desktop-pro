package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.InventoryMovementRequestDTO;
import com.apolomz.posbackend.dto.response.InventoryMovementResponseDTO;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/movements")
    public ResponseEntity<InventoryMovementResponseDTO> createMovement(
            @Valid @RequestBody InventoryMovementRequestDTO dto) {
        return new ResponseEntity<>(inventoryService.registerManualMovement(dto), HttpStatus.CREATED);
    }

    @GetMapping("/movements")
    public ResponseEntity<List<InventoryMovementResponseDTO>> getHistory(
            @RequestParam(required = false) Long productId) {
        return ResponseEntity.ok(inventoryService.getHistory(productId));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Product>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }
}