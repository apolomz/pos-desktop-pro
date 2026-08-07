package com.apolomz.posbackend.dto.response.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportDTO {
    private BigDecimal totalInventoryValue;
    private Long totalItemsInStock;
    private Long lowStockItemsCount;
    private Long outOfStockItemsCount;
    private List<CategoryBreakdownDTO> categories;
}
