package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.response.CategoryResponseDTO;
import com.apolomz.posbackend.dto.request.ProductRequestDTO;
import com.apolomz.posbackend.dto.response.ProductResponseDTO;
import com.apolomz.posbackend.model.Category;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.repository.CategoryRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // HU-025: Crear producto
    public ProductResponseDTO createProduct(ProductRequestDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .minStock(dto.getMinStock())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();

        return mapToDTO(productRepository.save(product));
    }

    // HU-026: Editar producto
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setMinStock(dto.getMinStock());
        product.setIsActive(dto.getIsActive());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);

        return mapToDTO(productRepository.save(product));
    }

    // HU-027: Eliminar producto
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productRepository.deleteById(id);
    }

    // HU-028: Buscar producto por nombre / listar todos
    public List<ProductResponseDTO> searchProducts(String name, Boolean activeOnly) {
        List<Product> products;
        boolean hasName = name != null && !name.trim().isEmpty();

        if (hasName && activeOnly != null) {
            products = productRepository.findByNameContainingIgnoreCaseAndIsActive(name.trim(), activeOnly);
        } else if (hasName) {
            products = productRepository.findByNameContainingIgnoreCase(name.trim());
        } else if (activeOnly != null) {
            products = productRepository.findByIsActive(activeOnly);
        } else {
            products = productRepository.findAll();
        }

        return products.stream().map(this::mapToDTO).toList();
    }

    // HU-029: Activar o desactivar producto
    public ProductResponseDTO toggleActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setIsActive(!product.getIsActive());
        return mapToDTO(productRepository.save(product));
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return mapToDTO(product);
    }

    private ProductResponseDTO mapToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setMinStock(product.getMinStock());
        dto.setIsActive(product.getIsActive());
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        if (product.getCategory() != null) {
            CategoryResponseDTO catDTO = new CategoryResponseDTO();
            catDTO.setId(product.getCategory().getId());
            catDTO.setName(product.getCategory().getName());
            catDTO.setDescription(product.getCategory().getDescription());
            dto.setCategory(catDTO);
        }

        return dto;
    }
}