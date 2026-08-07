package com.apolomz.posbackend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponseDTO {
    private Long id;
    private String name;
    private String documentNumber;
    private String phone;
    private String email;
    private Boolean isActive;
    private BigDecimal totalSpent;
    private Long totalSales;
    private LocalDateTime createdAt;
}