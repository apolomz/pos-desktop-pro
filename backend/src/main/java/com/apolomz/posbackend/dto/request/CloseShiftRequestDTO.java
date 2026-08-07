package com.apolomz.posbackend.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class CloseShiftRequestDTO {

    @NotNull(message = "El monto final reportado es obligatorio")
    @DecimalMin(value = "0.0", message = "El monto final no puede ser negativo")
    private BigDecimal actualFinalAmount;

    private String notes;
}
