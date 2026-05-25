package com.novello.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;
    private String shippingAddress;

    @Data
    public static class OrderItemRequest {
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String coverImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private String itemType; // HARDCOPY or EBOOK
    }
}
