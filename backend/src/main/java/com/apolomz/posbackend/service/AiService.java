package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.response.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class AiService {

    @Autowired
    private AiAnalyticsService analyticsService;

    private final RestClient restClient = RestClient.create();

    /**
     * Procesa la consulta usando la API Key proporcionada dinámicamente por el cliente.
     */
    public ChatResponse processChat(String userMessage, String clientGeminiApiKey) {
        Map<String, Object> metrics = analyticsService.getBusinessSummary();

        // 1. Si el cliente envió su API Key de Gemini, consumimos la API de Google
        if (clientGeminiApiKey != null && !clientGeminiApiKey.isBlank()) {
            try {
                String systemPrompt = analyticsService.buildSystemContextPrompt();
                String fullPrompt = systemPrompt + "\n\nPregunta del usuario: " + userMessage;

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + clientGeminiApiKey.trim();

                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(
                                Map.of("parts", List.of(Map.of("text", fullPrompt)))
                        )
                );

                Map<?, ?> response = restClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

                if (response != null && response.containsKey("candidates")) {
                    List<?> candidates = (List<?>) response.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                        Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                        List<?> parts = (List<?>) content.get("parts");
                        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                        String geminiReply = (String) firstPart.get("text");

                        return new ChatResponse(geminiReply, false);
                    }
                }
            } catch (Exception e) {
                // En caso de clave inválida, sin saldo o fallo de red, conmuta a modo local
                return generateLocalSmartResponse(userMessage, metrics, "Clave de Gemini no válida o límite excedido. Usando modo local.");
            }
        }

        // 2. Si no hay clave, responde el motor inteligente local
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
        } else if (msgLower.contains("cliente") || msgLower.contains("frecuente")) {
            reply.append(String.format(
                    "👥 **Análisis de Clientes:**\n\n" +
                            "Tienes un total de **%s** clientes registrados en el sistema.\n" +
                            "💡 *Consejo:* Ofrece un descuento especial del 5%% en su próxima compra para fidelizarlos.",
                    metrics.get("totalCustomers")
            ));
        } else {
            reply.append(String.format(
                    "🤖 **Asistente POS:**\n\n" +
                            "Puedo ayudarte a analizar tus ventas, revisar alertas de inventario o darte consejos de negocio.\n" +
                            "Actualmente tienes **%d** ventas registradas por un valor de **$%s**.\n\n" +
                            "Prueba preguntándome: *'¿Cómo van las ventas?'*, *'¿Qué productos tienen bajo stock?'* o *'Resumen de clientes'*.",
                    totalSales, totalRevenue
            ));
        }

        return new ChatResponse(reply.toString(), true);
    }
}