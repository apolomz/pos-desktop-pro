package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.response.reports.DashboardReportDTO;
import com.apolomz.posbackend.model.Category;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.model.Sale;
import com.apolomz.posbackend.repository.CategoryRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ReportService reportService;

    private Product testProduct;
    private Category testCategory;
    private Sale testSale;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Bebidas")
                .description("Bebidas frías y calientes")
                .build();

        testProduct = Product.builder()
                .id(10L)
                .name("Café Especial")
                .price(new BigDecimal("15000"))
                .stock(20)
                .minStock(5)
                .isActive(true)
                .category(testCategory)
                .build();

        testSale = Sale.builder()
                .id(100L)
                .subtotal(new BigDecimal("15000"))
                .tax(BigDecimal.ZERO)
                .total(new BigDecimal("15000"))
                .status("COMPLETED")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should generate dashboard report successfully for monthly timeframe")
    void testGetDashboardReportMonthly() {
        when(saleRepository.findByCreatedAtBetweenAndStatus(any(LocalDateTime.class), any(LocalDateTime.class), eq("COMPLETED")))
                .thenReturn(List.of(testSale));
        when(productRepository.findByIsActive(true))
                .thenReturn(List.of(testProduct));
        when(saleRepository.findTopSellingProducts(eq("COMPLETED"), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        DashboardReportDTO report = reportService.getDashboardReport("monthly");

        assertNotNull(report);
        assertNotNull(report.getKpis());
        assertNotNull(report.getMonthly());
        assertNotNull(report.getDaily());
        assertNotNull(report.getWeekly());
        assertNotNull(report.getYearly());
        assertNotNull(report.getInventorySummary());
        assertNotNull(report.getChartData());
        assertFalse(report.getChartData().isEmpty());

        assertEquals(1, report.getKpis().getTotalProductsCount());
        assertEquals(new BigDecimal("15000"), report.getMonthly().getTotalRevenue());
    }

    @Test
    @DisplayName("Should build time series chart data for daily timeframe")
    void testGetDashboardReportDailyTimeframe() {
        when(saleRepository.findByCreatedAtBetweenAndStatus(any(LocalDateTime.class), any(LocalDateTime.class), eq("COMPLETED")))
                .thenReturn(Collections.emptyList());
        when(productRepository.findByIsActive(true))
                .thenReturn(Collections.emptyList());

        DashboardReportDTO report = reportService.getDashboardReport("daily");

        assertNotNull(report);
        assertEquals(7, report.getChartData().size());
    }
}
