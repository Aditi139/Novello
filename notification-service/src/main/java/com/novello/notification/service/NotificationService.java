package com.novello.notification.service;

import com.novello.notification.dto.CreateNotificationRequest;
import com.novello.notification.entity.Notification;
import com.novello.notification.entity.NotificationType;
import com.novello.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification create(CreateNotificationRequest request) {
        NotificationType type = NotificationType.INFO;
        try {
            if (request.getType() != null) {
                type = NotificationType.valueOf(request.getType());
            }
        } catch (IllegalArgumentException ignored) {}

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(type)
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Long> getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return Map.of("unreadCount", count);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void sendOrderPlacedNotification(Long userId, Long orderId, String orderNumber) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Order Placed Successfully!");
        req.setMessage("Your order #" + orderNumber + " has been placed. We're processing your payment.");
        req.setType("ORDER_PLACED");
        req.setReferenceId(orderId);
        req.setReferenceType("ORDER");
        create(req);
    }

    public void sendPaymentSuccessNotification(Long userId, Long orderId, String orderNumber) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Payment Successful! 🎉");
        req.setMessage("Payment for order #" + orderNumber + " was successful. Your order is being processed.");
        req.setType("PAYMENT_SUCCESS");
        req.setReferenceId(orderId);
        req.setReferenceType("ORDER");
        create(req);
    }
}
