package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.ChatRequest;
import com.apolomz.posbackend.dto.response.ChatResponse;
import com.apolomz.posbackend.service.AiAnalyticsService;
import com.apolomz.posbackend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiAnalyticsService analyticsService;

    @Autowired
    private AiService aiService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getBusinessSummary());
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ChatResponse response = aiService.processChat(request.getMessage(), request.getApiKey());
        return ResponseEntity.ok(response);
    }
}