package com.apolomz.posbackend.dto.response;

import com.apolomz.posbackend.model.enums.MovementType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InventoryMovementResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private MovementType type;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private LocalDateTime createdAt;
}