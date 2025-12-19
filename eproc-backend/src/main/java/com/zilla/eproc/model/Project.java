package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * @deprecated Use {@link #boss} instead. Kept for backward compatibility.
     */
    @Deprecated
    @Column(nullable = false)
    private String owner;

    @Column(length = 10, columnDefinition = "varchar(10) default 'TZS'")
    private String currency;

    @Column(name = "budget_total")
    private BigDecimal budgetTotal;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // ADR: Project-Centric Authorization fields

    /**
     * The project owner/manager (PROJECT_MANAGER role).
     * Required for project-scoped access control.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boss_id")
    private User boss;

    /**
     * The assigned engineer (ENGINEER role).
     * Nullable - project may not have an engineer yet.
     * One engineer can only be assigned to one ACTIVE project at a time.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id")
    private User engineer;

    /**
     * Project lifecycle status.
     * Engineer becomes available when project is COMPLETED or CANCELLED.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Helper methods

    /**
     * Check if this project is currently active.
     */
    public boolean isActiveProject() {
        return status == ProjectStatus.ACTIVE;
    }

    /**
     * Check if a user is the boss/owner of this project.
     */
    public boolean isBoss(User user) {
        return boss != null && boss.getId().equals(user.getId());
    }

    /**
     * Check if a user is the assigned engineer for this project.
     */
    public boolean isEngineer(User user) {
        return engineer != null && engineer.getId().equals(user.getId());
    }
}
