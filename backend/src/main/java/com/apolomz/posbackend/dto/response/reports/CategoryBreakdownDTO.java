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
public class CategoryBreakdownDTO {
    private String category;
    private Long itemCount;
    private BigDecimal totalValue;
    private Double percentage;
}
