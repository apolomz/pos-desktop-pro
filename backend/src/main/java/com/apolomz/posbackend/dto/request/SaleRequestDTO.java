package com.apolomz.posbackend.dto.request;

import com.apolomz.posbackend.model.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaleRequestDTO {

    @NotEmpty(message = "La venta debe incluir al menos un producto")
    @Valid
    private List<SaleItemRequestDTO> items;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private Long customerId; // Opcional
}