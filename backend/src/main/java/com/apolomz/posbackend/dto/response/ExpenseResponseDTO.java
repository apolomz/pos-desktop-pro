package com.apolomz.posbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponseDTO {
    private Long id;
    private Long shiftId;
    private String category;
    private BigDecimal amount;
    private String description;
    private String registeredBy;
    private LocalDateTime createdAt;
}
