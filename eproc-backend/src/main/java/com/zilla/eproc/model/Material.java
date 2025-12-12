package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

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

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_unit", nullable = false)
    private MaterialUnit defaultUnit;

    @Column(name = "unit_type")
    private String unitType; // specific description if needed

    @Column(name = "reference_price")
    private BigDecimal referencePrice;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
