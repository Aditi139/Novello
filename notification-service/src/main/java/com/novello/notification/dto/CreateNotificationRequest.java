package com.novello.notification.dto;

import lombok.Data;

@Data
public class CreateNotificationRequest {
    private Long userId;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private String referenceType;
}
