package com.apolomz.posbackend.dto.request;

import com.apolomz.posbackend.model.enums.MovementType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryMovementRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private MovementType type; // ENTRY, EXIT, ADJUSTMENT

    @NotNull(message = "La cantidad/valor objetivo es obligatoria")
    private Integer quantity;

    private String reason;
}