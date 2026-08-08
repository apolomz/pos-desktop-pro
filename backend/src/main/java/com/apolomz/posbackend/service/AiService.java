package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.response.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiService {

    @Autowired
    private AiAnalyticsService analyticsService;

    /**
     * Procesa la consulta utilizando estrictamente el motor inteligente local offline.
     */
    public ChatResponse processChat(String userMessage, String clientGeminiApiKey) {
        Map<String, Object> metrics = analyticsService.getBusinessSummary();
        return generateLocalSmartResponse(userMessage, metrics, null);
    }

    /**
     * Motor de Inteligencia Local para Modo Offline o sin API Key.
     */
    private ChatResponse generateLocalSmartResponse(String message, Map<String, Object> metrics, String warningMsg) {
        String msgLower = message.toLowerCase();
        StringBuilder reply = new StringBuilder();

        if (warningMsg != null) {
            reply.append("⚠️ *").append(warningMsg).append("*\n\n");
        }

        long totalSales = (long) metrics.get("totalSalesCount");
        Object totalRevenue = metrics.get("totalRevenue");
        int lowStockCount = (int) metrics.get("lowStockCount");

        if (msgLower.contains("resumen") || msgLower.contains("ventas") || msgLower.contains("balance")) {
            reply.append(String.format(
                    "📊 **Resumen de Negocio Actual:**\n\n" +
                            "- Total Transacciones: **%d**\n" +
                            "- Ingresos Totales: **$%s**\n" +
                            "- Alertas de Stock Bajo: **%d productos**\n\n" +
                            "💡 *Sugerencia:* Mantén tus productos con bajo stock actualizados para evitar perder ventas.",
                    totalSales, totalRevenue, lowStockCount
            ));
        } else if (msgLower.contains("stock") || msgLower.contains("inventario") || msgLower.contains("agotado")) {
            reply.append(String.format(
                    "⚠️ **Diagnóstico de Inventario:**\n\n" +
                            "Tienes **%d** productos con stock igual o inferior a 5 unidades.\n" +
                            "Te recomendamos revisar el módulo de Inventario y coordinar reabastecimiento con tus proveedores.",
                    lowStockCount
            ));
        } else if (msgLower.contains("vendido") || msgLower.contains("mas vendido") || msgLower.contains("más vendido") || msgLower.contains("top productos") || msgLower.contains("top ventas") || msgLower.contains("rotación") || msgLower.contains("rotacion")) {
            List<?> topProducts = (List<?>) metrics.get("topProducts");
            if (topProducts != null && !topProducts.isEmpty()) {
                reply.append("🏆 **Productos más vendidos (Top Selling):**\n\n");
                for (int i = 0; i < topProducts.size(); i++) {
                    Map<?, ?> p = (Map<?, ?>) topProducts.get(i);
                    reply.append(String.format("%d. **%s** - %s vendidos (Categoría: %s, Stock: %s)\n", 
                            i + 1, p.get("name"), p.get("quantitySold"), p.get("category"), p.get("stock")));
                }
            } else {
                reply.append("🏆 **Productos más vendidos:** No hay suficientes ventas registradas para calcular el top de productos.");
            }
        } else if (msgLower.contains("cliente") || msgLower.contains("frecuente") || msgLower.contains("mejores clientes")) {
            List<?> frequentCustomers = (List<?>) metrics.get("frequentCustomers");
            if (frequentCustomers != null && !frequentCustomers.isEmpty()) {
                reply.append("👥 **Clientes más frecuentes (Top Customers):**\n\n");
                for (int i = 0; i < frequentCustomers.size(); i++) {
                    Map<?, ?> c = (Map<?, ?>) frequentCustomers.get(i);
                    reply.append(String.format("%d. **%s** - %s compras registradas (Total gastado: $%s)\n", 
                            i + 1, c.get("name"), c.get("salesCount"), c.get("totalSpent")));
                }
            } else {
                reply.append(String.format(
                        "👥 **Análisis de Clientes:**\n\n" +
                                "Tienes un total de **%s** clientes registrados en el sistema.\n" +
                                "Aún no hay compras registradas para calcular el top de clientes más frecuentes.",
                        metrics.get("totalCustomers")
                ));
            }
        } else if (msgLower.contains("sugerencia") || msgLower.contains("recomendación") || msgLower.contains("recomendacion") || msgLower.contains("consejo") || msgLower.contains("tips")) {
            List<?> recommendations = (List<?>) metrics.get("recommendations");
            if (recommendations != null && !recommendations.isEmpty()) {
                reply.append("💡 **Recomendaciones de Negocio:**\n\n");
                for (Object rec : recommendations) {
                    reply.append(String.format("- %s\n", rec));
                }
            } else {
                reply.append("💡 **Recomendaciones de Negocio:**\n\n" +
                        "- Revisa regularmente los niveles de stock para evitar desabasto.\n" +
                        "- Lanza promociones los días de menor movimiento para incentivar ventas.");
            }
        } else {
            reply.append(String.format(
                    "🤖 **Asistente POS:**\n\n" +
                            "Puedo ayudarte a analizar tus ventas, revisar alertas de inventario o darte consejos de negocio.\n" +
                            "Actualmente tienes **%d** ventas registradas por un valor de **$%s**.\n\n" +
                            "Prueba preguntándome: *'¿Cómo van las ventas?'*, *'¿Qué productos tienen bajo stock?'*, *'¿Cuáles son los productos más vendidos?'*, *'¿Quiénes son mis clientes frecuentes?'* o *'¿Qué recomendaciones tienes?'*.",
                    totalSales, totalRevenue
            ));
        }

        return new ChatResponse(reply.toString(), true);
    }
}