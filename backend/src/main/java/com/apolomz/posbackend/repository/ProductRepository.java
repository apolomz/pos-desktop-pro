package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // HU-028: Buscar producto por nombre
    List<Product> findByNameContainingIgnoreCase(String name);

    // Filtrar por estado activo
    List<Product> findByIsActive(Boolean isActive);

    // Buscar por nombre y estado
    List<Product> findByNameContainingIgnoreCaseAndIsActive(String name, Boolean isActive);

    @Query("SELECT p FROM Product p WHERE p.stock <= p.minStock AND p.isActive = true")
    List<Product> findLowStockProducts();
}