package com.apolomz.posbackend.dto.response;

public record LoginResponse(
        String token,
        String role,
        String username,
        String fullName
) {
}