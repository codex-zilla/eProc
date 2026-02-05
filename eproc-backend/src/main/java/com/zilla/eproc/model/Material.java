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

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Material entity - Represents a line item (material or labour) within a
 * Request.
 * Repurposed from the old catalog Material entity to serve as request items.
 */
@Entity
@Table(name = "materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Request request;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(name = "measurement_unit", nullable = false, length = 20)
    private String measurementUnit;

    @Column(name = "rate_estimate", nullable = false, precision = 18, scale = 2)
    private BigDecimal rateEstimate;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_estimate_type", nullable = false, length = 30)
    @Builder.Default
    private RateEstimateType rateEstimateType = RateEstimateType.ENGINEER_ESTIMATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 20)
    @Builder.Default
    private ResourceType resourceType = ResourceType.MATERIAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MaterialStatus status = MaterialStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "revision_number")
    @Builder.Default
    private Integer revisionNumber = 1;

    @Column(name = "audit_data", columnDefinition = "TEXT")
    private String auditData;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Computed total estimate = quantity × rateEstimate.
     */
    @Transient
    public BigDecimal getTotalEstimate() {
        if (quantity != null && rateEstimate != null) {
            return quantity.multiply(rateEstimate).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}
