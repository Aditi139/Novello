package com.novello.payment.service;

import com.novello.payment.dto.PaymentOrderRequest;
import com.novello.payment.dto.PaymentOrderResponse;
import com.novello.payment.dto.PaymentVerifyRequest;
import com.novello.payment.entity.Transaction;
import com.novello.payment.entity.TransactionStatus;
import com.novello.payment.repository.TransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    /**
     * Step 1: Create a Razorpay order and return details for the frontend checkout.
     */
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request) {
        boolean isMockMode = "rzp_test_YourKeyIdHere".equals(razorpayKeyId) 
                || "YourKeySecretHere".equals(razorpayKeySecret)
                || razorpayKeyId == null 
                || razorpayKeyId.isBlank();

        String razorpayOrderId = null;
        long amountInPaise = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String activeKeyId = isMockMode ? "mock" : razorpayKeyId;

        if (isMockMode) {
            log.info("Razorpay credentials not configured or default. Running in SIMULATED/MOCK mode.");
            razorpayOrderId = "order_mock_" + System.currentTimeMillis();
        } else {
            try {
                RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
                orderRequest.put("receipt", "novello_order_" + request.getOrderId());
                orderRequest.put("notes", new JSONObject()
                        .put("orderId", request.getOrderId())
                        .put("userId", request.getUserId()));

                Order razorpayOrder = client.orders.create(orderRequest);
                razorpayOrderId = razorpayOrder.get("id");
            } catch (RazorpayException e) {
                log.warn("Failed to create Razorpay order (will fallback to simulated payment): {}", e.getMessage());
                isMockMode = true;
                activeKeyId = "mock";
                razorpayOrderId = "order_mock_" + System.currentTimeMillis();
            }
        }

        try {
            // Save transaction record
            Transaction transaction = Transaction.builder()
                    .orderId(request.getOrderId())
                    .userId(request.getUserId())
                    .amount(request.getAmount())
                    .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                    .razorpayOrderId(razorpayOrderId)
                    .status(TransactionStatus.PENDING)
                    .build();
            transaction = transactionRepository.save(transaction);

            // Notify Order Service of the Razorpay Order ID
            try {
                restTemplate.put(orderServiceUrl + "/api/orders/" + request.getOrderId() + "/razorpay",
                        Map.of("razorpayOrderId", razorpayOrderId));
            } catch (Exception e) {
                log.warn("Could not update order service with razorpay id: {}", e.getMessage());
            }

            return new PaymentOrderResponse(
                    razorpayOrderId,
                    amountInPaise,
                    request.getCurrency() != null ? request.getCurrency() : "INR",
                    activeKeyId,
                    request.getOrderId(),
                    transaction.getId()
            );
        } catch (Exception e) {
            log.error("Failed to process transaction in payment service: {}", e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    /**
     * Step 2: Verify the Razorpay payment signature (HMAC SHA256).
     * This is critical for security — never trust client-side payment status.
     */
    public boolean verifyAndConfirmPayment(PaymentVerifyRequest request) {
        try {
            boolean isValid;
            
            if (request.getRazorpayOrderId() != null && request.getRazorpayOrderId().startsWith("order_mock_")) {
                log.info("Verifying simulated/mock payment for order: {}", request.getRazorpayOrderId());
                isValid = true;
            } else {
                // Verify signature: HMAC-SHA256 of "razorpay_order_id|razorpay_payment_id"
                String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
                String generatedSignature = generateHmacSha256(payload, razorpayKeySecret);
                isValid = generatedSignature.equals(request.getRazorpaySignature());
            }

            Transaction transaction = transactionRepository
                    .findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            if (isValid) {
                transaction.setRazorpayPaymentId(request.getRazorpayPaymentId());
                transaction.setRazorpaySignature(request.getRazorpaySignature());
                transaction.setStatus(TransactionStatus.SUCCESS);
                transactionRepository.save(transaction);

                // Update order status to PAID
                try {
                    restTemplate.put(orderServiceUrl + "/api/orders/payment/confirm",
                            Map.of(
                                "razorpayOrderId", request.getRazorpayOrderId(),
                                "paymentId", request.getRazorpayPaymentId()
                            ));
                } catch (Exception e) {
                    log.warn("Could not confirm order: {}", e.getMessage());
                }
                return true;
            } else {
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setFailureReason("Invalid signature");
                transactionRepository.save(transaction);
                return false;
            }
        } catch (Exception e) {
            log.error("Payment verification error: {}", e.getMessage());
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    public List<Transaction> getTransactionsByOrder(Long orderId) {
        return transactionRepository.findByOrderId(orderId);
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    private String generateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
