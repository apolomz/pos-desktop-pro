package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank String username,
        @NotBlank String password,
        @NotNull Long roleId
) {}