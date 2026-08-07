package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.BusinessConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessConfigRepository extends JpaRepository<BusinessConfig, Long> {
    Optional<BusinessConfig> findFirstByOrderByIdAsc();
}
