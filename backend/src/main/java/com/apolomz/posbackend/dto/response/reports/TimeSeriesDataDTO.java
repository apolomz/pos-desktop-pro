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
public class TimeSeriesDataDTO {
    private String label;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
    private Long salesCount;
}
