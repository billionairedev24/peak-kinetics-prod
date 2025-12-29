package com.peakkineticspt.repository;

import com.peakkineticspt.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // ============ Thread-related queries ============

    /**
     * Find all messages in a thread, ordered by creation date
     */
    List<Message> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    /**
     * Find only original messages (thread roots)
     */
    List<Message> findByIsReplyFalseOrderByCreatedAtDesc();

    /**
     * Find replies to a specific message
     */
    List<Message> findByParentMessageIdOrderByCreatedAtAsc(Long parentMessageId);

    /**
     * Count replies in a thread
     */
    Integer countByThreadIdAndIsReplyTrue(Long threadId);

    /**
     * Count total messages in a thread
     */
    Integer countByThreadId(Long threadId);

    // ============ Read status queries ============

    /**
     * Find unread messages ordered by creation date (new method)
     */
    List<Message> findByReadFalseOrderByCreatedAtDesc();

    /**
     * Find unread messages (legacy method for backward compatibility)
     */
    List<Message> findByReadFalse();

    /**
     * Find read messages
     */
    List<Message> findByReadTrueOrderByCreatedAtDesc();

    /**
     * Find threads with unread messages
     */
    @Query("SELECT DISTINCT m.threadId FROM Message m WHERE m.read = false")
    List<Long> findThreadIdsWithUnreadMessages();

    /**
     * Check if a thread has any unread messages
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Message m " +
            "WHERE m.threadId = :threadId AND m.read = false")
    Boolean hasUnreadMessagesInThread(@Param("threadId") Long threadId);

    // ============ Email/Customer queries ============

    /**
     * Find all messages by email (useful for customer history)
     */
    List<Message> findByEmailOrderByCreatedAtDesc(String email);

    /**
     * Find all threads initiated by a specific email
     */
    @Query("SELECT m FROM Message m WHERE m.email = :email AND m.isReply = false " +
            "ORDER BY m.createdAt DESC")
    List<Message> findOriginalMessagesByEmail(@Param("email") String email);

    // ============ Search queries ============

    /**
     * Search messages by content
     */
    @Query("SELECT m FROM Message m WHERE LOWER(m.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY m.createdAt DESC")
    List<Message> searchByMessageContent(@Param("searchTerm") String searchTerm);

    /**
     * Search messages by sender name
     */
    @Query("SELECT m FROM Message m WHERE LOWER(m.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(m.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY m.createdAt DESC")
    List<Message> searchBySenderName(@Param("searchTerm") String searchTerm);

    /**
     * Full text search across multiple fields
     */
    @Query("SELECT m FROM Message m WHERE " +
            "LOWER(m.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(m.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY m.createdAt DESC")
    List<Message> fullTextSearch(@Param("searchTerm") String searchTerm);

    // ============ Sender type queries ============

    /**
     * Find messages by sender type (customer/admin)
     */
    List<Message> findBySenderTypeOrderByCreatedAtDesc(String senderType);

    /**
     * Find customer messages (original messages)
     */
    @Query("SELECT m FROM Message m WHERE m.senderType = 'customer' " +
            "ORDER BY m.createdAt DESC")
    List<Message> findCustomerMessages();

    /**
     * Find admin replies
     */
    @Query("SELECT m FROM Message m WHERE m.senderType = 'admin' AND m.isReply = true " +
            "ORDER BY m.createdAt DESC")
    List<Message> findAdminReplies();

    // ============ Statistics queries ============

    /**
     * Count unread messages
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.read = false")
    Long countUnreadMessages();

    /**
     * Count messages in a date range
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.createdAt BETWEEN :startDate AND :endDate")
    Long countMessagesBetweenDates(@Param("startDate") java.time.LocalDateTime startDate,
                                   @Param("endDate") java.time.LocalDateTime endDate);

    /**
     * Get all admin replies with their parent messages for calculating response time
     * Process in service layer for database-agnostic calculation
     */
    @Query("SELECT reply FROM Message reply JOIN FETCH reply.parentMessage parent " +
            "WHERE reply.isReply = true AND reply.senderType = 'admin'")
    List<Message> findAdminRepliesWithParent();

    // ============ Existence checks ============

    /**
     * Check if a thread exists
     */
    boolean existsByThreadId(Long threadId);

    /**
     * Check if a message has replies
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Message m " +
            "WHERE m.parentMessage.id = :messageId")
    Boolean hasReplies(@Param("messageId") Long messageId);
}