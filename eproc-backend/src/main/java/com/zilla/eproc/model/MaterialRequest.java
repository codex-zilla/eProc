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

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
