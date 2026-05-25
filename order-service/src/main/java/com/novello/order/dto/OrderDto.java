package com.novello.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private List<OrderItemDto> items;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String paymentId;
    private String razorpayOrderId;
    private LocalDateTime createdAt;

    @Data
    public static class OrderItemDto {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String coverImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String itemType;
    }
}
