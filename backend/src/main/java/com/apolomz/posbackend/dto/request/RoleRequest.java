package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String name;

    @Size(max = 255)
    private String description;
}