package com.apolomz.posbackend.dto.response.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodSummaryDTO {
    private String periodName;
    private Long totalSalesCount;
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal netProfit;
    private Double profitMargin;
    private BigDecimal averageTicket;
}
