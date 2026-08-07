package com.apolomz.posbackend.dto.request;

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
public class ExpenseRequestDTO {

    @NotBlank(message = "La categoría es obligatoria (PAYROLL, RAW_MATERIAL, OTHER)")
    private String category;

    @NotNull(message = "El monto del egreso es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotBlank(message = "La descripción del egreso es obligatoria")
    private String description;
}
