package com.novello.order.repository;

import com.novello.order.entity.Order;
import com.novello.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    List<Order> findByStatus(OrderStatus status);
}
