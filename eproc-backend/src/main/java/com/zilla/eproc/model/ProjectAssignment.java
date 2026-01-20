package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a user's assignment to a specific project with a defined role.
 * This entity enables project-specific access control and responsibility
 * tracking.
 * 
 * Key concept: A User can have multiple assignments across different projects,
 * and each project can have multiple users with different roles.
 */
@Entity
@Table(name = "project_assignments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "project_id", "user_id", "role" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    /**
     * The role this user plays on this specific project.
     * Different from User.role which is the global system role.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role;

    /**
     * The level of responsibility/authority within this role.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "responsibility_level", nullable = false)
    @Builder.Default
    private ResponsibilityLevel responsibilityLevel = ResponsibilityLevel.FULL;

    /**
     * Who this person reports to on this project (name or role).
     */
    @Column(name = "reporting_line")
    private String reportingLine;

    /**
     * When this assignment started. Required for accountability tracking.
     */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * When this assignment ended. Null if still active.
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * Whether this assignment is currently active.
     */
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Helper methods

    /**
     * Check if this assignment is currently active.
     */
    public boolean isCurrentlyActive() {
        return Boolean.TRUE.equals(isActive) && (endDate == null || endDate.isAfter(LocalDate.now()));
    }
}
