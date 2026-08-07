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
public class CashShiftResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userFullName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal initialBase;
    private BigDecimal cashSalesTotal;
    private BigDecimal totalExpenses;
    private BigDecimal expectedFinalAmount;
    private BigDecimal actualFinalAmount;
    private BigDecimal difference;
    private String status;
    private String notes;
}
