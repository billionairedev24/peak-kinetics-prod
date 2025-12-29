package com.peakkineticspt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMessageRequest {
        @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
        private String firstName;

        @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone must be in E.164 format")
        private String phone;

        @Size(max = 500, message = "Address must not exceed 500 characters")
        private String address;

        @NotBlank(message = "Message is required")
        @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
        private String message;
    }

    /**
     * Response DTO for a single message (original or reply)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private Long id;
        private Long threadId;
        private Long parentMessageId;
        private Boolean isReply;
        private String senderType;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String address;
        private String message;
        private Boolean read;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer replyCount; // Only populated for original messages
    }

    /**
     * Response DTO for an entire conversation thread
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThreadResponse {
        private Long threadId;
        private MessageResponse originalMessage;
        private List<MessageResponse> replies;
        private Integer totalMessages;
        private LocalDateTime lastActivityAt;
        private Boolean hasUnreadMessages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReplyRequest {
        @NotNull(message = "Parent message ID is required")
        private Long parentMessageId;

        @NotBlank(message = "Reply message is required")
        @Size(min = 10, max = 2000, message = "Reply must be between 10 and 2000 characters")
        private String message;

        // Admin info (sender of the reply)
        private String adminName;

        @Email(message = "Admin email must be valid")
        private String adminEmail;
    }
}
