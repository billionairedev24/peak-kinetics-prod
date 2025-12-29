package com.peakkineticspt.service;

import com.peakkineticspt.dto.MessageDTOs;

import java.util.List;

public interface IMessageService {

    /**
     * Create a new message (starts a new thread)
     */
    MessageDTOs.MessageResponse createMessage(MessageDTOs.CreateMessageRequest request);

    /**
     * Create a reply to an existing message
     */
    MessageDTOs.MessageResponse createReply(MessageDTOs.CreateReplyRequest request);

    /**
     * Get all messages with optional status filter
     * @param status - "unread", "read", or null for all
     */
    List<MessageDTOs.MessageResponse> getAllMessages(String status);

    /**
     * Get all message threads (grouped conversations)
     */
    List<MessageDTOs.ThreadResponse> getAllThreads();

    /**
     * Get a specific thread with all its messages
     */
    MessageDTOs.ThreadResponse getThread(Long threadId);

    /**
     * Get a single message by ID
     */
    MessageDTOs.MessageResponse getMessage(Long messageId);

    /**
     * Mark a single message as read
     */
    void markAsRead(long messageId);

    /**
     * Mark all messages in a thread as read
     */
    void markThreadAsRead(Long threadId);

    /**
     * Delete a message (if original, deletes entire thread)
     */
    void deleteMessage(long messageId);

    /**
     * Delete an entire thread
     */
    void deleteThread(Long threadId);

    /**
     * Get average response time in minutes (database-agnostic)
     */
    Double getAverageResponseTimeInMinutes();
}