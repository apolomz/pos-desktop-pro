package com.apolomz.posbackend.dto.response;

import com.apolomz.posbackend.dto.response.CategoryResponseDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer minStock;
    private Boolean isActive;
    private String imageUrl;
    private CategoryResponseDTO category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}