package com.apolomz.posbackend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SaleResponseDTO {
    private Long id;
    private String sellerUsername;
    private Long customerId;
    private String customerName;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private List<SaleDetailResponseDTO> details;
}