package com.apolomz.posbackend.dto.response;

public record UserResponse(

        Long id,

        String fullName,

        String username,

        String role
) {}