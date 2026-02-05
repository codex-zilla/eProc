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
 * Material request entity representing a BOQ (Bill of Quantities) item request.
 * Combines traditional material requisition with structured BOQ practices.
 * Supports both catalog materials (via material_id) and manual entry (via
 * manual_material_name).
 * 
 * Phase 1 (BOQ Alignment): Added BOQ code, work description, measurement units,
 * and cost estimation.
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

    /**
     * Optional: Link to a BOQ batch if this request is part of a batch submission.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private BoqBatch batch;

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

    /**
     * Reference to the user who created this request.
     * Nullable to allow preservation of historical requests after user deletion.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;

    /**
     * Reference to the user deletion audit record if the requesting user was
     * deleted.
     * Used to retrieve historical user information after hard deletion.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_user_snapshot_id")
    private UserDeletionAudit deletedUserSnapshot;

    @Column(name = "rejection_comment")
    private String rejectionComment;

    @Column(name = "emergency_flag")
    @Builder.Default
    private Boolean emergencyFlag = false;

    // BOQ (Bill of Quantities) fields - Phase 1

    /**
     * BOQ reference code following pattern: BOQ-{section}-{trade}-{sequence}
     * Example: BOQ-03-RC-001 (Section 03, Reinforced Concrete, Item 001)
     */
    @Column(name = "boq_reference_code", length = 50)
    private String boqReferenceCode;

    /**
     * Detailed description of the work item.
     * Mandatory when boqReferenceCode is provided.
     */
    @Column(name = "work_description", columnDefinition = "TEXT")
    private String workDescription;

    /**
     * Standard measurement unit for this work item.
     * Constrained vocabulary: m³, m², m, kg, No, LS, ton, bag, bundle, trip, drum,
     * pcs
     */
    @Column(name = "measurement_unit", length = 20)
    private String measurementUnit;

    /**
     * Rate estimate per measurement unit.
     */
    @Column(name = "rate_estimate", precision = 18, scale = 2)
    private BigDecimal rateEstimate;

    /**
     * Type of rate estimate.
     * Values: ENGINEER_ESTIMATE, MARKET_RATE, TENDER_RATE
     */
    @Column(name = "rate_type", length = 30)
    @Builder.Default
    private String rateType = "ENGINEER_ESTIMATE";

    /**
     * Revision number for tracking BOQ item evolution.
     * Incremented on each resubmission after rejection.
     */
    @Column(name = "revision_number")
    @Builder.Default
    private Integer revisionNumber = 1;

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
     * Computed total estimate = quantity × rateEstimate.
     * NOT persisted to database; calculated dynamically in DTOs.
     */
    @Transient
    public BigDecimal getTotalEstimate() {
        if (quantity != null && rateEstimate != null) {
            return quantity.multiply(rateEstimate).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    /**
     * Audit trail for this request.
     * Cascaded delete when request is deleted.
     */
    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RequestAuditLog> auditLogs = new java.util.ArrayList<>();
}
