package com.novello.payment.controller;

import com.novello.payment.dto.PaymentOrderRequest;
import com.novello.payment.dto.PaymentOrderResponse;
import com.novello.payment.dto.PaymentVerifyRequest;
import com.novello.payment.entity.Transaction;
import com.novello.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create Razorpay payment order — called before showing the payment modal.
     */
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(@RequestBody PaymentOrderRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request));
    }

    /**
     * Verify payment signature — called after Razorpay checkout completes.
     * This is the security-critical step.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        boolean success = paymentService.verifyAndConfirmPayment(request);
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified successfully! Your order is confirmed."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Payment verification failed. Please contact support."
            ));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Transaction>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getTransactionsByOrder(orderId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getTransactionsByUser(userId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Transaction>> getAll() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }
}
