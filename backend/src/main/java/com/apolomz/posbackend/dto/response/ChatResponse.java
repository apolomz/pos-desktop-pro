package com.apolomz.posbackend.dto.response;

import java.time.LocalDateTime;

public class ChatResponse {
    private String reply;
    private LocalDateTime timestamp;
    private boolean offlineMode;

    public ChatResponse() {}

    public ChatResponse(String reply, boolean offlineMode) {
        this.reply = reply;
        this.timestamp = LocalDateTime.now();
        this.offlineMode = offlineMode;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isOfflineMode() {
        return offlineMode;
    }

    public void setOfflineMode(boolean offlineMode) {
        this.offlineMode = offlineMode;
    }
}