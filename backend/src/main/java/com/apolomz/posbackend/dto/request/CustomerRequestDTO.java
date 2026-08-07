package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;
    private String documentNumber;
    private String phone;
    private String email;
}