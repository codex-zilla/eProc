package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * Represents a scope category within a project.
 * Tracks what work is included in the project (Civil, Electrical, etc.).
 */
@Entity
@Table(name = "project_scopes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectScope {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScopeCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Whether this scope category is included in the project.
     */
    @Column(name = "is_included")
    @Builder.Default
    private Boolean isIncluded = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
