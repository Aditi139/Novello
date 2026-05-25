package com.novello.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String razorpayOrderId;
    private Long amount;       // in paise
    private String currency;
    private String keyId;      // Razorpay Key ID for frontend
    private Long orderId;      // Novello order ID
    private Long transactionId;
}
