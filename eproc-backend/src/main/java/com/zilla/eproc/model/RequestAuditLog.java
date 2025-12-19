package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit log entry for tracking material request status changes.
 * Every state change is logged for transparency and accountability.
 */
@Entity
@Table(name = "request_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The request this audit entry belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private MaterialRequest request;

    /**
     * The user who performed the action.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /**
     * The action that was performed.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private RequestAuditAction action;

    /**
     * Snapshot of the request status at the time of this action.
     * Useful for future-proofing if status logic changes.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status_snapshot")
    private RequestStatus statusSnapshot;

    /**
     * Optional comment (e.g., rejection reason).
     */
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    /**
     * When this action occurred.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
