package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.MessageDTOs;
import com.peakkineticspt.entity.Message;
import com.peakkineticspt.repository.MessageRepository;
import com.peakkineticspt.service.IMessageService;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements IMessageService {

    private final MessageRepository messageRepository;
    private final Tracer tracer;

    @Override
    @Transactional
    public MessageDTOs.MessageResponse createMessage(MessageDTOs.CreateMessageRequest request) {
        Span span = tracer.spanBuilder("message.create").startSpan();
        try {
            Message message = Message.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .message(request.getMessage())
                    .read(false)
                    .isReply(false)
                    .senderType("customer")
                    .build();

            message = messageRepository.save(message);

            // Set threadId to its own ID for original messages
            message.setThreadId(message.getId());
            message = messageRepository.save(message);

            span.setAttribute("message.id", message.getId());
            span.setAttribute("message.email", message.getEmail());
            span.setAttribute("thread.id", message.getThreadId());

            return toResponse(message);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public MessageDTOs.MessageResponse createReply(MessageDTOs.CreateReplyRequest request) {
        Span span = tracer.spanBuilder("message.reply").startSpan();
        try {
            // Find the parent message
            Message parentMessage = messageRepository.findById(request.getParentMessageId())
                    .orElseThrow(() -> new RuntimeException("Parent message not found with id: "
                            + request.getParentMessageId()));

            span.setAttribute("parent.message.id", parentMessage.getId());
            span.setAttribute("thread.id", parentMessage.getThreadId());

            // Create the reply message
            Message reply = Message.builder()
                    .threadId(parentMessage.getThreadId())
                    .parentMessage(parentMessage)
                    .isReply(true)
                    .senderType("admin")
                    .firstName(request.getAdminName())
                    .email(request.getAdminEmail())
                    .message(request.getMessage())
                    .read(false)
                    // Copy contact info from parent for context
                    .lastName(parentMessage.getLastName())
                    .phone(parentMessage.getPhone())
                    .address(parentMessage.getAddress())
                    .build();

            reply = messageRepository.save(reply);

            span.setAttribute("reply.message.id", reply.getId());

            log.info("Created reply {} for parent message {} in thread {}",
                    reply.getId(), parentMessage.getId(), parentMessage.getThreadId());

            return toResponse(reply);
        } finally {
            span.end();
        }
    }

    @Override
    public List<MessageDTOs.MessageResponse> getAllMessages(String status) {
        Span span = tracer.spanBuilder("message.getAll").startSpan();
        try {
            List<Message> messages;

            if ("unread".equalsIgnoreCase(status)) {
                messages = messageRepository.findByReadFalseOrderByCreatedAtDesc();
            } else if ("read".equalsIgnoreCase(status)) {
                messages = messageRepository.findAll().stream()
                        .filter(Message::getRead)
                        .toList();
            } else {
                messages = messageRepository.findAll();
            }

            span.setAttribute("messages.count", messages.size());

            return messages.stream()
                    .map(this::toResponse)
                    .toList();
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTOs.ThreadResponse> getAllThreads() {
        Span span = tracer.spanBuilder("message.getAllThreads").startSpan();
        try {
            // Get all original messages (thread roots)
            List<Message> originalMessages = messageRepository.findByIsReplyFalseOrderByCreatedAtDesc();

            span.setAttribute("threads.count", originalMessages.size());

            return originalMessages.stream()
                    .map(original -> getThread(original.getThreadId()))
                    .collect(Collectors.toList());

        } finally {
            span.end();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MessageDTOs.ThreadResponse getThread(Long threadId) {
        Span span = tracer.spanBuilder("message.getThread").startSpan();
        try {
            span.setAttribute("thread.id", threadId);

            List<Message> threadMessages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);

            if (threadMessages.isEmpty()) {
                throw new RuntimeException("Thread not found with id: " + threadId);
            }

            Message originalMessage = threadMessages.stream()
                    .filter(m -> !m.getIsReply())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Original message not found in thread"));

            List<MessageDTOs.MessageResponse> replies = threadMessages.stream()
                    .filter(Message::getIsReply)
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            LocalDateTime lastActivity = threadMessages.stream()
                    .map(Message::getCreatedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(originalMessage.getCreatedAt());

            return MessageDTOs.ThreadResponse.builder()
                    .threadId(threadId)
                    .originalMessage(toResponse(originalMessage))
                    .replies(replies)
                    .totalMessages(threadMessages.size())
                    .lastActivityAt(lastActivity)
                    .build();

        } finally {
            span.end();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageResponseTimeInMinutes() {
        Span span = tracer.spanBuilder("message.getAverageResponseTime").startSpan();
        try {
            List<Message> adminReplies = messageRepository.findAdminRepliesWithParent();

            if (adminReplies.isEmpty()) {
                return 0.0;
            }

            long totalMinutes = adminReplies.stream()
                    .filter(reply -> reply.getParentMessage() != null)
                    .mapToLong(reply -> {
                        LocalDateTime parentTime = reply.getParentMessage().getCreatedAt();
                        LocalDateTime replyTime = reply.getCreatedAt();
                        return java.time.Duration.between(parentTime, replyTime).toMinutes();
                    })
                    .sum();

            double average = (double) totalMinutes / adminReplies.size();

            span.setAttribute("replies.count", adminReplies.size());
            span.setAttribute("average.response.minutes", average);

            return average;
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MessageDTOs.MessageResponse getMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));
        return toResponse(message);
    }

    @Override
    @Transactional
    public void markAsRead(long messageId) {
        Span span = tracer.spanBuilder("message.markAsRead").startSpan();
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            message.setRead(true);
            messageRepository.save(message);

            span.setAttribute("message.id", messageId);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void markThreadAsRead(Long threadId) {
        Span span = tracer.spanBuilder("message.markThreadAsRead").startSpan();
        try {
            List<Message> threadMessages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);

            threadMessages.forEach(message -> message.setRead(true));
            messageRepository.saveAll(threadMessages);

            span.setAttribute("thread.id", threadId);
            span.setAttribute("messages.updated", threadMessages.size());
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void deleteMessage(long messageId) {
        Span span = tracer.spanBuilder("message.delete").startSpan();
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            // If deleting an original message, delete entire thread
            if (!message.getIsReply()) {
                List<Message> threadMessages = messageRepository.findByThreadIdOrderByCreatedAtAsc(message.getThreadId());
                messageRepository.deleteAll(threadMessages);
                span.setAttribute("thread.deleted", true);
                span.setAttribute("messages.deleted", threadMessages.size());
            } else {
                // Just delete the single reply
                messageRepository.deleteById(messageId);
                span.setAttribute("thread.deleted", false);
            }

            span.setAttribute("message.id", messageId);
        } finally {
            span.end();
        }
    }

    @Override
    @Transactional
    public void deleteThread(Long threadId) {
        Span span = tracer.spanBuilder("message.deleteThread").startSpan();
        try {
            List<Message> threadMessages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);

            if (threadMessages.isEmpty()) {
                throw new RuntimeException("Thread not found with id: " + threadId);
            }

            messageRepository.deleteAll(threadMessages);

            span.setAttribute("thread.id", threadId);
            span.setAttribute("messages.deleted", threadMessages.size());
        } finally {
            span.end();
        }
    }

    private MessageDTOs.MessageResponse toResponse(Message message) {
        Integer replyCount = message.getIsReply() ? null :
                messageRepository.countByThreadIdAndIsReplyTrue(message.getThreadId());

        return MessageDTOs.MessageResponse.builder()
                .id(message.getId())
                .threadId(message.getThreadId())
                .parentMessageId(message.getParentMessage() != null ?
                        message.getParentMessage().getId() : null)
                .isReply(message.getIsReply())
                .senderType(message.getSenderType())
                .firstName(message.getFirstName())
                .lastName(message.getLastName())
                .email(message.getEmail())
                .phone(message.getPhone())
                .address(message.getAddress())
                .message(message.getMessage())
                .read(message.getRead())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .replyCount(replyCount)
                .build();
    }
}