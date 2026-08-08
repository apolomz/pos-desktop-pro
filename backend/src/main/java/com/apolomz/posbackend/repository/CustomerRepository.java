package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByDocumentNumber(String documentNumber);

    @Query("SELECT c FROM Customer c WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "(c.documentNumber IS NOT NULL AND LOWER(c.documentNumber) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    @Query("SELECT SUM(s.total) FROM Sale s WHERE s.customer.id = :customerId")
    BigDecimal getTotalSpentByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId")
    Long getSalesCountByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT s.customer.id, s.customer.name, COUNT(s), SUM(s.total) " +
           "FROM Sale s " +
           "WHERE s.customer IS NOT NULL AND s.status = :status " +
           "GROUP BY s.customer.id, s.customer.name " +
           "ORDER BY COUNT(s) DESC")
    List<Object[]> findFrequentCustomers(@Param("status") String status, Pageable pageable);
}