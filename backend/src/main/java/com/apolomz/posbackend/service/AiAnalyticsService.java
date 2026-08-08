package com.apolomz.posbackend.service;

import com.apolomz.posbackend.repository.CustomerRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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

        // 4. Productos más vendidos (Top 5)
        List<Object[]> topSellingData = saleRepository.findTopSellingProducts("COMPLETED", PageRequest.of(0, 5));
        List<Map<String, Object>> topProducts = topSellingData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("name", row[1]);
            map.put("category", row[2]);
            map.put("quantitySold", row[3]);
            map.put("revenue", row[4]);
            map.put("stock", row[5]);
            return map;
        }).collect(Collectors.toList());
        summary.put("topProducts", topProducts);

        // 5. Clientes más frecuentes (Top 5)
        List<Object[]> frequentData = customerRepository.findFrequentCustomers("COMPLETED", PageRequest.of(0, 5));
        List<Map<String, Object>> frequentCustomers = frequentData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("name", row[1]);
            map.put("salesCount", row[2]);
            map.put("totalSpent", row[3]);
            return map;
        }).collect(Collectors.toList());
        summary.put("frequentCustomers", frequentCustomers);

        // 6. Recomendaciones inteligentes automáticas
        List<String> recommendations = new ArrayList<>();
        if (!lowStockProducts.isEmpty()) {
            String lowStockNames = lowStockProducts.stream()
                    .limit(3)
                    .map(p -> (String) p.get("name"))
                    .collect(Collectors.joining(", "));
            recommendations.add("Reabastecimiento urgente: Los productos (" + lowStockNames + ") tienen stock crítico (5 o menos). Se recomienda reabastecer.");
        }
        if (!topProducts.isEmpty()) {
            Map<String, Object> bestProduct = topProducts.get(0);
            recommendations.add("Promoción de Combo: El producto '" + bestProduct.get("name") + "' es el más vendido (" + bestProduct.get("quantitySold") + " unidades). Crea combos con él para rotar otros items.");
        }
        if (!frequentCustomers.isEmpty()) {
            Map<String, Object> bestCustomer = frequentCustomers.get(0);
            recommendations.add("Fidelización: '" + bestCustomer.get("name") + "' es tu cliente más frecuente (" + bestCustomer.get("salesCount") + " compras). Ofrécele un 10% de descuento de lealtad.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Optimización comercial: Revisa el balance de ingresos y mantén activo tu catálogo de productos.");
        }
        summary.put("recommendations", recommendations);

        return summary;
    }

    /**
     * Genera un prompt con el contexto actual del negocio para enviar a la IA.
     */
    public String buildSystemContextPrompt() {
        Map<String, Object> data = getBusinessSummary();

        // 1. Métricas básicas
        String line1 = String.format("- Ventas: %s transacciones, ingresos $%s.", data.get("totalSalesCount"), data.get("totalRevenue"));
        String line2 = String.format("- Catálogo: %s productos (%s stock bajo), Clientes: %s.", data.get("totalProducts"), data.get("lowStockCount"), data.get("totalCustomers"));

        // 2. Top productos (Top 3)
        List<?> topProducts = (List<?>) data.get("topProducts");
        String line3 = "- Top Productos: Ninguno.";
        if (topProducts != null && !topProducts.isEmpty()) {
            line3 = "- Top Productos: " + topProducts.stream().limit(3)
                    .map(p -> String.format("%s (%s u.)", ((Map<?, ?>) p).get("name"), ((Map<?, ?>) p).get("quantitySold")))
                    .collect(Collectors.joining(", ")) + ".";
        }

        // 3. Clientes frecuentes (Top 3)
        List<?> frequentCustomers = (List<?>) data.get("frequentCustomers");
        String line4 = "- Top Clientes: Ninguno.";
        if (frequentCustomers != null && !frequentCustomers.isEmpty()) {
            line4 = "- Top Clientes: " + frequentCustomers.stream().limit(3)
                    .map(c -> String.format("%s (%s compras)", ((Map<?, ?>) c).get("name"), ((Map<?, ?>) c).get("salesCount")))
                    .collect(Collectors.joining(", ")) + ".";
        }

        // 4. Stock crítico
        String line5 = String.format("- Alertas: Tienes %s items con bajo stock.", data.get("lowStockCount"));

        return String.format(
                "Eres el Asistente Inteligente de un POS comercial. Responde breve y profesional a las consultas del usuario.\n" +
                "Contexto comercial del negocio (máximo 5 renglones):\n" +
                "%s\n%s\n%s\n%s\n%s\n" +
                "Brinda consejos directos y orientados a mejorar las ventas.",
                line1, line2, line3, line4, line5
        );
    }
}