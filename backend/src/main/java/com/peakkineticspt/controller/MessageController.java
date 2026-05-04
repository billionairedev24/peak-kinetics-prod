package com.peakkineticspt.controller;

import com.peakkineticspt.dto.MessageDTOs;
import com.peakkineticspt.security.TurnstileService;
import com.peakkineticspt.service.IMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {


    private final IMessageService messageService;
    private final TurnstileService turnstile;

    /**
     * Create a new message (original message, starts a new thread)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createMessage(
            @Valid @RequestBody MessageDTOs.CreateMessageRequest request,
            @RequestHeader(value = "Cf-Turnstile-Response", required = false) String turnstileToken,
            HttpServletRequest httpRequest) {
        if (!turnstile.verify(turnstileToken, httpRequest.getRemoteAddr())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Bot verification failed. Please refresh and try again."));
        }
        MessageDTOs.MessageResponse response = messageService.createMessage(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent successfully! We'll respond within 2 hours.",
                "data", Map.of(
                        "id", response.getId(),
                        "threadId", response.getThreadId(),
                        "email", response.getEmail(),
                        "createdAt", response.getCreatedAt()
                )
        ));
    }

    /**
     * Reply to an existing message
     */
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<Map<String, Object>> replyToMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody MessageDTOs.CreateReplyRequest request) {

        log.info("Creating reply to message ID: {}", messageId);

        // Set the parent message ID from the path variable
        request.setParentMessageId(messageId);

        MessageDTOs.MessageResponse response = messageService.createReply(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Reply sent successfully",
                "data", Map.of(
                        "id", response.getId(),
                        "threadId", response.getThreadId(),
                        "parentMessageId", response.getParentMessageId(),
                        "createdAt", response.getCreatedAt()
                )
        ));
    }

    /**
     * Alternative endpoint: Reply using thread ID
     */
    @PostMapping("/thread/{threadId}/reply")
    public ResponseEntity<Map<String, Object>> replyToThread(
            @PathVariable Long threadId,
            @Valid @RequestBody MessageDTOs.CreateReplyRequest request) {

        log.info("Creating reply to thread: {}", threadId);

        // Find the original message in the thread to set as parent
        MessageDTOs.ThreadResponse thread = messageService.getThread(threadId);
        request.setParentMessageId(thread.getOriginalMessage().getId());

        MessageDTOs.MessageResponse response = messageService.createReply(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Reply sent successfully",
                "data", Map.of(
                        "id", response.getId(),
                        "threadId", response.getThreadId(),
                        "parentMessageId", response.getParentMessageId(),
                        "createdAt", response.getCreatedAt()
                )
        ));
    }

    /**
     * Get all messages (flat list) - LEGACY ENDPOINT
     */
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAllMessages(
            @RequestParam(required = false) String status) {
        List<MessageDTOs.MessageResponse> messages = messageService.getAllMessages(status);
        long unread = messages.stream().filter(m -> !m.getRead()).count();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", messages,
                "total", messages.size(),
                "unread", unread
        ));
    }

    /**
     * Get all threads (grouped conversations) - NEW RECOMMENDED ENDPOINT
     */
    @GetMapping("/admin/threads")
    public ResponseEntity<Map<String, Object>> getAllThreads() {
        log.info("Fetching all message threads");
        List<MessageDTOs.ThreadResponse> threads = messageService.getAllThreads();

        long unreadThreads = threads.stream()
                .filter(thread -> thread.getReplies().stream()
                        .anyMatch(reply -> !reply.getRead()) ||
                        !thread.getOriginalMessage().getRead())
                .count();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", threads,
                "total", threads.size(),
                "unreadThreads", unreadThreads
        ));
    }

    /**
     * Get a single message by ID
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> getMessage(@PathVariable Long messageId) {
        MessageDTOs.MessageResponse response = messageService.getMessage(messageId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    /**
     * Get an entire thread (original message + all replies)
     */
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<Map<String, Object>> getThread(@PathVariable Long threadId) {
        log.info("Fetching thread: {}", threadId);
        MessageDTOs.ThreadResponse response = messageService.getThread(threadId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    /**
     * Mark a single message as read
     */
    @PatchMapping("/admin/{messageId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message marked as read"
        ));
    }

    /**
     * Mark all messages in a thread as read
     */
    @PatchMapping("/admin/thread/{threadId}/read")
    public ResponseEntity<Map<String, Object>> markThreadAsRead(@PathVariable Long threadId) {
        log.info("Marking thread {} as read", threadId);
        messageService.markThreadAsRead(threadId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thread marked as read"
        ));
    }

    /**
     * Delete a message (if original, deletes entire thread)
     */
    @DeleteMapping("/admin/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable long messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message deleted successfully"
        ));
    }

    /**
     * Delete an entire thread
     */
    @DeleteMapping("/admin/thread/{threadId}")
    public ResponseEntity<Map<String, Object>> deleteThread(@PathVariable Long threadId) {
        log.info("Deleting thread: {}", threadId);
        messageService.deleteThread(threadId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thread deleted successfully"
        ));
    }

    /**
     * Get statistics including average response time
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.info("Fetching message statistics");

        List<MessageDTOs.ThreadResponse> threads = messageService.getAllThreads();
        List<MessageDTOs.MessageResponse> allMessages = messageService.getAllMessages(null);
        Double avgResponseTime = messageService.getAverageResponseTimeInMinutes();

        long unreadCount = allMessages.stream().filter(m -> !m.getRead()).count();
        long totalThreads = threads.size();
        long totalMessages = allMessages.size();
        long totalReplies = allMessages.stream().filter(MessageDTOs.MessageResponse::getIsReply).count();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalThreads", totalThreads,
                        "totalMessages", totalMessages,
                        "totalReplies", totalReplies,
                        "unreadMessages", unreadCount,
                        "averageResponseTimeMinutes", avgResponseTime != null ? avgResponseTime : 0.0
                )
        ));
    }
}