package com.apolomz.posbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "initial_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal initialBase;

    @Column(name = "expected_final_amount", precision = 12, scale = 2)
    private BigDecimal expectedFinalAmount;

    @Column(name = "actual_final_amount", precision = 12, scale = 2)
    private BigDecimal actualFinalAmount;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    public void prePersist() {
        if (this.openedAt == null) {
            this.openedAt = LocalDateTime.now();
        }
    }
}
