package com.apolomz.posbackend.repository;

import com.apolomz.posbackend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByShiftIdOrderByCreatedAtDesc(Long shiftId);

    List<Expense> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.shift.id = :shiftId")
    BigDecimal sumAmountByShiftId(@Param("shiftId") Long shiftId);
}
