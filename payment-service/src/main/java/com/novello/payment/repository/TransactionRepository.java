package com.novello.payment.repository;

import com.novello.payment.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);
    List<Transaction> findByOrderId(Long orderId);
    List<Transaction> findByUserId(Long userId);
}
