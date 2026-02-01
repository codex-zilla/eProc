package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit trail for deleted users.
 * Preserves user information after hard deletion to maintain audit history
 * and allow references from historical transactions.
 */
@Entity
@Table(name = "user_deletion_audit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDeletionAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Original user ID before deletion.
     */
    @Column(name = "deleted_user_id", nullable = false)
    private Long deletedUserId;

    /**
     * User's email at time of deletion.
     */
    @Column(name = "deleted_user_email", nullable = false)
    private String deletedUserEmail;

    /**
     * User's name at time of deletion.
     */
    @Column(name = "deleted_user_name", nullable = false)
    private String deletedUserName;

    /**
     * User's system role at time of deletion.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "deleted_user_role", nullable = false)
    private Role deletedUserRole;

    /**
     * User's phone number at time of deletion.
     */
    @Column(name = "deleted_user_phone")
    private String deletedUserPhone;

    /**
     * User's title at time of deletion.
     */
    @Column(name = "deleted_user_title")
    private String deletedUserTitle;

    /**
     * User's ERB number at time of deletion.
     */
    @Column(name = "deleted_user_erb_number")
    private String deletedUserErbNumber;

    /**
     * Whether the user had active project assignments at deletion time.
     */
    @Column(name = "was_active", nullable = false)
    private Boolean wasActive;

    /**
     * Number of active project assignments at deletion time.
     */
    @Column(name = "active_project_count", nullable = false)
    private Integer activeProjectCount;

    /**
     * ID of the user who performed the deletion (typically PROJECT_OWNER).
     */
    @Column(name = "deleted_by", nullable = false)
    private Long deletedBy;

    /**
     * Email of the user who performed the deletion.
     */
    @Column(name = "deleted_by_email", nullable = false)
    private String deletedByEmail;

    /**
     * Name of the user who performed the deletion.
     */
    @Column(name = "deleted_by_name", nullable = false)
    private String deletedByName;

    /**
     * Timestamp when the deletion occurred.
     */
    @CreationTimestamp
    @Column(name = "deleted_at", nullable = false, updatable = false)
    private LocalDateTime deletedAt;

    /**
     * Optional reason or notes for deletion.
     */
    @Column(name = "deletion_reason", columnDefinition = "TEXT")
    private String deletionReason;
}
