package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.CashShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashShiftRepository extends JpaRepository<CashShift, Long> {
    Optional<CashShift> findByUserIdAndStatus(Long userId, String status);

    Optional<CashShift> findFirstByStatusOrderByOpenedAtDesc(String status);

    List<CashShift> findByUserIdOrderByOpenedAtDesc(Long userId);

    List<CashShift> findAllByOrderByOpenedAtDesc();
}
