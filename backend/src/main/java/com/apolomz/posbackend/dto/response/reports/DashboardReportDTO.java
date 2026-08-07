package com.apolomz.posbackend.dto.response.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardReportDTO {
    private KPIStatsDTO kpis;
    private PeriodSummaryDTO daily;
    private PeriodSummaryDTO weekly;
    private PeriodSummaryDTO monthly;
    private PeriodSummaryDTO yearly;
    private List<TopProductDTO> topProducts;
    private List<TimeSeriesDataDTO> chartData;
    private InventoryReportDTO inventorySummary;
}
