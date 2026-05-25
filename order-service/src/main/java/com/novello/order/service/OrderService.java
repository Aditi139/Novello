package com.novello.order.service;

import com.novello.order.dto.CreateOrderRequest;
import com.novello.order.dto.OrderDto;
import com.novello.order.entity.Order;
import com.novello.order.entity.OrderItem;
import com.novello.order.entity.OrderStatus;
import com.novello.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        String orderNumber = "NOV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                             "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(request.getUserId())
                .shippingAddress(request.getShippingAddress())
                .status(OrderStatus.PAYMENT_PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> items = request.getItems().stream().map(itemReq -> {
            BigDecimal totalPrice = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            return OrderItem.builder()
                    .order(order)
                    .bookId(itemReq.getBookId())
                    .bookTitle(itemReq.getBookTitle())
                    .bookAuthor(itemReq.getBookAuthor())
                    .coverImageUrl(itemReq.getCoverImageUrl())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(totalPrice)
                    .itemType(itemReq.getItemType() != null ?
                              OrderItem.ItemType.valueOf(itemReq.getItemType()) :
                              OrderItem.ItemType.HARDCOPY)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(items);
        order.setTotalAmount(total);

        return toDto(orderRepository.save(order));
    }

    public List<OrderDto> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long id) {
        return toDto(orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id)));
    }

    public OrderDto getOrderByNumber(String orderNumber) {
        return toDto(orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber)));
    }

    @Transactional
    public OrderDto updateOrderPayment(String razorpayOrderId, String paymentId) {
        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found for razorpay id: " + razorpayOrderId));
        order.setPaymentId(paymentId);
        order.setStatus(OrderStatus.PAID);
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto setRazorpayOrderId(Long orderId, String razorpayOrderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setRazorpayOrderId(razorpayOrderId);
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(OrderStatus.valueOf(status));
        return toDto(orderRepository.save(order));
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPaymentId(order.getPaymentId());
        dto.setRazorpayOrderId(order.getRazorpayOrderId());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(order.getItems().stream().map(item -> {
            OrderDto.OrderItemDto idto = new OrderDto.OrderItemDto();
            idto.setId(item.getId());
            idto.setBookId(item.getBookId());
            idto.setBookTitle(item.getBookTitle());
            idto.setBookAuthor(item.getBookAuthor());
            idto.setCoverImageUrl(item.getCoverImageUrl());
            idto.setQuantity(item.getQuantity());
            idto.setUnitPrice(item.getUnitPrice());
            idto.setTotalPrice(item.getTotalPrice());
            idto.setItemType(item.getItemType() != null ? item.getItemType().name() : null);
            return idto;
        }).collect(Collectors.toList()));
        return dto;
    }
}
