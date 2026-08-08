package com.apolomz.posbackend.dto.request;

public class ChatRequest {
    private String message;
    private String apiKey; // Clave de Gemini enviada por el cliente

    public ChatRequest() {}

    public ChatRequest(String message, String apiKey) {
        this.message = message;
        this.apiKey = apiKey;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}