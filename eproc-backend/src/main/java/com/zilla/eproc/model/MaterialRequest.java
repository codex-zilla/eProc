package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Material request entity representing a request for materials at a site.
 * Supports both catalog materials (via material_id) and manual entry (via
 * manual_material_name).
 */
@Entity
@Table(name = "material_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_package_id")
    private WorkPackage workPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "manual_material_name")
    private String manualMaterialName;

    @Column(name = "manual_unit")
    private String manualUnit;

    @Column(name = "manual_estimated_price")
    private BigDecimal manualEstimatedPrice;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    // Phase 3 additions

    @Column(name = "planned_usage_start")
    private LocalDateTime plannedUsageStart;

    @Column(name = "planned_usage_end")
    private LocalDateTime plannedUsageEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;

    @Column(name = "rejection_comment")
    private String rejectionComment;

    @Column(name = "emergency_flag")
    @Builder.Default
    private Boolean emergencyFlag = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Audit trail for this request.
     * Cascaded delete when request is deleted.
     */
    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RequestAuditLog> auditLogs = new java.util.ArrayList<>();
}
