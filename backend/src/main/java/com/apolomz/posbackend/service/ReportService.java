package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.response.reports.*;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.model.Sale;
import com.apolomz.posbackend.repository.CategoryRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final BigDecimal ESTIMATED_COST_RATIO = new BigDecimal("0.65"); // 65% costo, 35% margen

    public DashboardReportDTO getDashboardReport(String timeframe) {
        String filterPeriod = (timeframe == null || timeframe.isBlank()) ? "monthly" : timeframe.toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        // 1. Períodos Financieros
        PeriodSummaryDTO daily = calculatePeriodSummary("Hoy", now.truncatedTo(ChronoUnit.DAYS), now);
        PeriodSummaryDTO weekly = calculatePeriodSummary("Esta Semana", now.minusDays(7), now);
        PeriodSummaryDTO monthly = calculatePeriodSummary("Este Mes", now.minusDays(30), now);
        PeriodSummaryDTO yearly = calculatePeriodSummary("Este Año", now.minusDays(365), now);

        // 2. Inventario
        InventoryReportDTO inventoryReport = calculateInventoryReport();

        // 3. KPIs
        List<Product> activeProducts = productRepository.findByIsActive(true);
        long lowStockCount = activeProducts.stream()
                .filter(p -> p.getStock() != null && p.getMinStock() != null && p.getStock() <= p.getMinStock())
                .count();

        // Crecimiento de ingresos (mes actual vs mes anterior)
        BigDecimal currentPeriodRev = monthly.getTotalRevenue();
        PeriodSummaryDTO prevMonth = calculatePeriodSummary("Mes Anterior", now.minusDays(60), now.minusDays(30));
        BigDecimal prevPeriodRev = prevMonth.getTotalRevenue();

        double growthPercentage = 0.0;
        if (prevPeriodRev.compareTo(BigDecimal.ZERO) > 0) {
            growthPercentage = currentPeriodRev.subtract(prevPeriodRev)
                    .divide(prevPeriodRev, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } else if (currentPeriodRev.compareTo(BigDecimal.ZERO) > 0) {
            growthPercentage = 100.0;
        }

        KPIStatsDTO kpis = KPIStatsDTO.builder()
                .todaySalesCount(daily.getTotalSalesCount())
                .todayRevenue(daily.getTotalRevenue())
                .monthlyRevenue(monthly.getTotalRevenue())
                .monthlyProfit(monthly.getNetProfit())
                .totalProductsCount((long) activeProducts.size())
                .lowStockCount(lowStockCount)
                .revenueGrowthPercentage(Math.round(growthPercentage * 10.0) / 10.0)
                .build();

        // 4. Productos más vendidos
        List<TopProductDTO> topProducts = getTopSellingProducts();

        // 5. Datos para gráficos según timeframe
        List<TimeSeriesDataDTO> chartData = buildChartData(filterPeriod, now);

        return DashboardReportDTO.builder()
                .kpis(kpis)
                .daily(daily)
                .weekly(weekly)
                .monthly(monthly)
                .yearly(yearly)
                .topProducts(topProducts)
                .chartData(chartData)
                .inventorySummary(inventoryReport)
                .build();
    }

    private PeriodSummaryDTO calculatePeriodSummary(String periodName, LocalDateTime start, LocalDateTime end) {
        List<Sale> sales = saleRepository.findByCreatedAtBetweenAndStatus(start, end, STATUS_COMPLETED);

        long salesCount = sales.size();
        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = totalRevenue.multiply(ESTIMATED_COST_RATIO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netProfit = totalRevenue.subtract(totalCost).setScale(2, RoundingMode.HALF_UP);

        double profitMargin = 0.0;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        BigDecimal avgTicket = salesCount > 0
                ? totalRevenue.divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return PeriodSummaryDTO.builder()
                .periodName(periodName)
                .totalSalesCount(salesCount)
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .netProfit(netProfit)
                .profitMargin(Math.round(profitMargin * 10.0) / 10.0)
                .averageTicket(avgTicket)
                .build();
    }

    private List<TopProductDTO> getTopSellingProducts() {
        List<Object[]> results = saleRepository.findTopSellingProducts(STATUS_COMPLETED, PageRequest.of(0, 5));
        List<TopProductDTO> topProducts = new ArrayList<>();

        for (Object[] row : results) {
            topProducts.add(TopProductDTO.builder()
                    .productId((Long) row[0])
                    .productName((String) row[1])
                    .categoryName((String) row[2])
                    .unitsSold(((Number) row[3]).longValue())
                    .totalRevenue((BigDecimal) row[4])
                    .currentStock((Integer) row[5])
                    .build());
        }

        // Si no hay suficientes datos de ventas, complementar con lista de productos activos
        if (topProducts.isEmpty()) {
            List<Product> products = productRepository.findByIsActive(true);
            int limit = Math.min(5, products.size());
            for (int i = 0; i < limit; i++) {
                Product p = products.get(i);
                topProducts.add(TopProductDTO.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : "General")
                        .unitsSold(0L)
                        .totalRevenue(BigDecimal.ZERO)
                        .currentStock(p.getStock() != null ? p.getStock() : 0)
                        .build());
            }
        }

        return topProducts;
    }

    private InventoryReportDTO calculateInventoryReport() {
        List<Product> products = productRepository.findByIsActive(true);

        BigDecimal totalValue = BigDecimal.ZERO;
        long totalItems = 0;
        long lowStockCount = 0;
        long outOfStockCount = 0;

        Map<String, CategoryValueAccumulator> categoryMap = new HashMap<>();

        for (Product p : products) {
            int stock = p.getStock() != null ? p.getStock() : 0;
            int minStock = p.getMinStock() != null ? p.getMinStock() : 0;
            BigDecimal price = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
            BigDecimal itemValue = price.multiply(BigDecimal.valueOf(stock));

            totalItems += stock;
            totalValue = totalValue.add(itemValue);

            if (stock == 0) {
                outOfStockCount++;
            } else if (stock <= minStock) {
                lowStockCount++;
            }

            String catName = p.getCategory() != null ? p.getCategory().getName() : "Sin Categoría";
            CategoryValueAccumulator accum = categoryMap.computeIfAbsent(catName, k -> new CategoryValueAccumulator());
            accum.itemCount += stock;
            accum.totalValue = accum.totalValue.add(itemValue);
        }

        final BigDecimal finalTotalValue = totalValue;
        List<CategoryBreakdownDTO> categories = new ArrayList<>();
        for (Map.Entry<String, CategoryValueAccumulator> entry : categoryMap.entrySet()) {
            double pct = 0.0;
            if (finalTotalValue.compareTo(BigDecimal.ZERO) > 0) {
                pct = entry.getValue().totalValue.divide(finalTotalValue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            categories.add(CategoryBreakdownDTO.builder()
                    .category(entry.getKey())
                    .itemCount(entry.getValue().itemCount)
                    .totalValue(entry.getValue().totalValue)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        return InventoryReportDTO.builder()
                .totalInventoryValue(totalValue)
                .totalItemsInStock(totalItems)
                .lowStockItemsCount(lowStockCount)
                .outOfStockItemsCount(outOfStockCount)
                .categories(categories)
                .build();
    }

    private List<TimeSeriesDataDTO> buildChartData(String timeframe, LocalDateTime now) {
        List<TimeSeriesDataDTO> points = new ArrayList<>();

        if ("daily".equals(timeframe)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE", Locale.of("es", "CO"));
            for (int i = 6; i >= 0; i--) {
                LocalDateTime start = now.minusDays(i).truncatedTo(ChronoUnit.DAYS);
                LocalDateTime end = start.plusDays(1);
                PeriodSummaryDTO summary = calculatePeriodSummary("Dia", start, end);
                points.add(TimeSeriesDataDTO.builder()
                        .label(start.format(formatter))
                        .revenue(summary.getTotalRevenue())
                        .cost(summary.getTotalCost())
                        .profit(summary.getNetProfit())
                        .salesCount(summary.getTotalSalesCount())
                        .build());
            }
        } else if ("weekly".equals(timeframe)) {
            for (int i = 3; i >= 0; i--) {
                LocalDateTime start = now.minusWeeks(i + 1);
                LocalDateTime end = now.minusWeeks(i);
                PeriodSummaryDTO summary = calculatePeriodSummary("Semana", start, end);
                points.add(TimeSeriesDataDTO.builder()
                        .label("Sem " + (4 - i))
                        .revenue(summary.getTotalRevenue())
                        .cost(summary.getTotalCost())
                        .profit(summary.getNetProfit())
                        .salesCount(summary.getTotalSalesCount())
                        .build());
            }
        } else if ("yearly".equals(timeframe)) {
            for (int i = 4; i >= 0; i--) {
                LocalDateTime start = now.minusYears(i + 1);
                LocalDateTime end = now.minusYears(i);
                PeriodSummaryDTO summary = calculatePeriodSummary("Año", start, end);
                points.add(TimeSeriesDataDTO.builder()
                        .label(String.valueOf(now.getYear() - i))
                        .revenue(summary.getTotalRevenue())
                        .cost(summary.getTotalCost())
                        .profit(summary.getNetProfit())
                        .salesCount(summary.getTotalSalesCount())
                        .build());
            }
        } else {
            // Default "monthly" - últimos 6 meses
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM", Locale.of("es", "CO"));
            for (int i = 5; i >= 0; i--) {
                LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
                LocalDateTime end = (i == 0) ? now : start.plusMonths(1);
                PeriodSummaryDTO summary = calculatePeriodSummary("Mes", start, end);
                String monthLabel = start.format(formatter);
                monthLabel = monthLabel.substring(0, 1).toUpperCase() + monthLabel.substring(1).replace(".", "");
                points.add(TimeSeriesDataDTO.builder()
                        .label(monthLabel)
                        .revenue(summary.getTotalRevenue())
                        .cost(summary.getTotalCost())
                        .profit(summary.getNetProfit())
                        .salesCount(summary.getTotalSalesCount())
                        .build());
            }
        }

        return points;
    }

    private static class CategoryValueAccumulator {
        long itemCount = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
    }
}
