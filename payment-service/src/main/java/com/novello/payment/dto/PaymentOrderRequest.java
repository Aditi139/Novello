package com.novello.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentOrderRequest {
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String currency = "INR";
}
