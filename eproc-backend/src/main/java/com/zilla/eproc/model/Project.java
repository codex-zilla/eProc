package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
     * @deprecated Legacy field. Use {@link #owner} User relationship instead.
     */
    @Deprecated
    @Column(name = "owner_email")
    private String ownerEmail;

    @Column(length = 10, columnDefinition = "varchar(10) default 'TZS'")
    private String currency;

    @Column(name = "budget_total")
    private BigDecimal budgetTotal;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "site_location")
    private String siteLocation;

    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String ward;

    // === NEW: Core Identification ===

    /**
     * Auto-generated project code (e.g., PRJ-HTL-2026-001).
     */
    @Column(unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    private Industry industry;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type")
    private ProjectType projectType;

    // === NEW: Owner Representative ===

    @Column(name = "owner_rep_name")
    private String ownerRepName;

    @Column(name = "owner_rep_contact")
    private String ownerRepContact;

    // === NEW: Location Details ===

    @Column(name = "plot_number")
    private String plotNumber;

    @Column(name = "gps_coordinates")
    private String gpsCoordinates;

    @Column(name = "title_deed_available")
    private Boolean titleDeedAvailable;

    @Column(name = "site_access_notes", columnDefinition = "TEXT")
    private String siteAccessNotes;

    // === NEW: Project Context ===

    @Column(name = "key_objectives", columnDefinition = "TEXT")
    private String keyObjectives;

    @Column(name = "expected_output", columnDefinition = "TEXT")
    private String expectedOutput;

    // === NEW: Timeline ===

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    // === NEW: Contractual ===

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type")
    private ContractType contractType;

    @Column(name = "defects_liability_period")
    private Integer defectsLiabilityPeriod;

    @Column(name = "performance_security_required")
    private Boolean performanceSecurityRequired;

    // === NEW: Relationships to child entities ===

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectAssignment> teamAssignments = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectScope> scopes = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectMilestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectDocument> documents = new ArrayList<>();

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // ADR: Project-Centric Authorization fields

    /**
     * The project owner (PROJECT_OWNER system role).
     * Required for project-scoped access control.
     * Team members are managed via ProjectAssignment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    /**
     * Project lifecycle status.
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
     * Check if a user is the owner of this project.
     */
    public boolean isOwner(User user) {
        return owner != null && owner.getId().equals(user.getId());
    }
}
