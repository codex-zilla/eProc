package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Request entity - Represents a BOQ (Bill of Quantities) request.
 * Replaces BoqBatch entity.
 * A request contains multiple Material items (materials/labour).
 */
@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "planned_start_date")
    private LocalDateTime plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDateTime plannedEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.SUBMITTED;

    @Column(name = "additional_details", columnDefinition = "TEXT")
    private String additionalDetails;

    @Column(name = "boq_reference_code", unique = true, length = 50)
    private String boqReferenceCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Material items that belong to this request.
     */
    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Material> materials = new ArrayList<>();

    /**
     * Audit logs for this request.
     */
    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestAuditLog> auditLogs = new ArrayList<>();

    /**
     * Compute total value of all materials in the request.
     */
    @Transient
    public Double getTotalValue() {
        return materials.stream()
                .mapToDouble(item -> {
                    if (item.getQuantity() != null && item.getRateEstimate() != null) {
                        return item.getQuantity().doubleValue() * item.getRateEstimate().doubleValue();
                    }
                    return 0.0;
                })
                .sum();
    }

    /**
     * Get count of materials in this request.
     */
    @Transient
    public int getMaterialCount() {
        return materials.size();
    }

    /**
     * Update request status based on material statuses.
     * APPROVED only if ALL materials are APPROVED, else REJECTED.
     */
    public void updateStatusFromMaterials() {
        if (materials.isEmpty()) {
            return;
        }

        boolean allApproved = materials.stream()
                .allMatch(m -> m.getStatus() == MaterialStatus.APPROVED);

        this.status = allApproved ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    }
}
