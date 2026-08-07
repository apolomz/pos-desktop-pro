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
public class KPIStatsDTO {
    private Long todaySalesCount;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal monthlyProfit;
    private Long totalProductsCount;
    private Long lowStockCount;
    private Double revenueGrowthPercentage;
}
