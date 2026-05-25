package com.novello.order.controller;

import com.novello.order.dto.CreateOrderRequest;
import com.novello.order.dto.OrderDto;
import com.novello.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDto>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @PutMapping("/{id}/razorpay")
    public ResponseEntity<OrderDto> setRazorpayId(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.setRazorpayOrderId(id, body.get("razorpayOrderId")));
    }

    @PutMapping("/payment/confirm")
    public ResponseEntity<OrderDto> confirmPayment(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderPayment(
                body.get("razorpayOrderId"), body.get("paymentId")));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id,
                                                  @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
