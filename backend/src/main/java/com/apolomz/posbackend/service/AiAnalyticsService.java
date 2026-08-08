package com.apolomz.posbackend.service;

import com.apolomz.posbackend.repository.CustomerRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAnalyticsService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * Compila un resumen estructurado para el Dashboard de Analítica y Contexto de la IA.
     */
    public Map<String, Object> getBusinessSummary() {
        Map<String, Object> summary = new HashMap<>();

        // 1. Métricas de Ventas Totales
        var allSales = saleRepository.findAll();
        long totalSalesCount = allSales.size();
        BigDecimal totalRevenue = allSales.stream()
                .map(sale -> sale.getTotal() != null ? sale.getTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.put("totalSalesCount", totalSalesCount);
        summary.put("totalRevenue", totalRevenue);

        // 2. Estado de Inventario y Alertas de Stock Bajo
        var allProducts = productRepository.findAll();
        long totalProducts = allProducts.size();
        var lowStockProducts = allProducts.stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 5) // Alerta si stock <= 5
                .map(p -> Map.of("id", p.getId(), "name", p.getName(), "stock", p.getStock()))
                .collect(Collectors.toList());

        summary.put("totalProducts", totalProducts);
        summary.put("lowStockCount", lowStockProducts.size());
        summary.put("lowStockItems", lowStockProducts);

        // 3. Clientes Registrados
        long totalCustomers = customerRepository.count();
        summary.put("totalCustomers", totalCustomers);

        return summary;
    }

    /**
     * Genera un prompt con el contexto actual del negocio para enviar a la IA.
     */
    public String buildSystemContextPrompt() {
        Map<String, Object> data = getBusinessSummary();

        return String.format(
                "Eres el Asistente Inteligente de un sistema POS comercial.\n" +
                        "Estado actual del negocio:\n" +
                        "- Ventas registradas: %s transacciones por un total de $%s\n" +
                        "- Productos en catálogo: %s (%s con stock bajo)\n" +
                        "- Clientes registrados: %s\n\n" +
                        "Responde a las consultas del usuario con consejos breves, profesionales y orientados a mejorar las ventas.",
                data.get("totalSalesCount"),
                data.get("totalRevenue"),
                data.get("totalProducts"),
                data.get("lowStockCount"),
                data.get("totalCustomers")
        );
    }
}