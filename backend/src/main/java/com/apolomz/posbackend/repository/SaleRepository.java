package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.Sale;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCreatedAtGreaterThanEqualAndStatus(LocalDateTime start, String status);

    List<Sale> findByCreatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);

    List<Sale> findByStatus(String status);

    @Query("SELECT sd.product.id, sd.product.name, sd.product.category.name, SUM(sd.quantity), SUM(sd.subtotal), sd.product.stock " +
           "FROM SaleDetail sd WHERE sd.sale.status = :status " +
           "GROUP BY sd.product.id, sd.product.name, sd.product.category.name, sd.product.stock " +
           "ORDER BY SUM(sd.quantity) DESC")
    List<Object[]> findTopSellingProducts(@Param("status") String status, Pageable pageable);
}