package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SaleItemRequestDTO {
    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a 0")
    private Integer quantity;
}