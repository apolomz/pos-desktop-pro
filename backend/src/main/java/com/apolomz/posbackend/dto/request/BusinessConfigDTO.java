package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessConfigDTO {

    private Long id;

    @NotBlank(message = "El nombre del negocio es obligatorio")
    private String name;

    private String nit;
    private String address;
    private String phone;
    private String email;

    @NotNull(message = "El porcentaje de impuesto es obligatorio")
    @DecimalMin(value = "0.0", message = "El impuesto no puede ser negativo")
    @DecimalMax(value = "100.0", message = "El impuesto no puede superar el 100%")
    private BigDecimal taxPercentage;

    private String logoUrl;
}
