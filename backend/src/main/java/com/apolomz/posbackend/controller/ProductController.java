package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.ProductRequestDTO;
import com.apolomz.posbackend.dto.response.ProductResponseDTO;
import com.apolomz.posbackend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // HU-028: Buscar / listar productos
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        return ResponseEntity.ok(productService.searchProducts(search, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // HU-025: Crear producto
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto));
    }

    // HU-026: Editar producto
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    // HU-027: Eliminar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // HU-029: Activar o desactivar producto
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ProductResponseDTO> toggleProductStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleActive(id));
    }
}