package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User entity representing system users with role-based access.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String name;

    /**
     * Phone number for site-level coordination.
     */
    @Column(name = "phone_number")
    private String phoneNumber;

    /**
     * Professional title (e.g., "Senior Engineer").
     * Note: This is informational only. Authority comes from
     * ProjectAssignment.role.
     */
    private String title;

    /**
     * Engineers Registration Board (ERB) number.
     * Required for engineers in Tanzania for compliance validation.
     */
    @Column(name = "erb_number")
    private String erbNumber;

    /**
     * Whether the user account is active.
     * Inactive users cannot log in or be assigned to projects.
     */
    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    /**
     * ID of the project owner who created this user.
     * Null for self-registered users (ENGINEER role).
     */
    @Column(name = "created_by")
    private Long createdBy;

    /**
     * Whether the user must change their password on next login.
     * Set to true when user is created by project owner with default password.
     */
    @Column(name = "require_password_change")
    @Builder.Default
    private Boolean requirePasswordChange = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
