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
public class OpenShiftRequestDTO {

    @NotNull(message = "La base inicial de caja es obligatoria")
    @DecimalMin(value = "0.0", message = "La base inicial no puede ser negativa")
    private BigDecimal initialBase;
}
