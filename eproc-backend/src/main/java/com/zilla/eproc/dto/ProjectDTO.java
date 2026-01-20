package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;

    @Deprecated
    private String owner; // kept for backward compatibility

    private String currency;
    private BigDecimal budgetTotal;
    private String description;
    private String siteLocation;
    private String region;
    private String district;
    private String ward;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // ADR: Project-Centric Authorization fields
    private Long bossId;
    private String bossName;
    private String bossEmail;

    private Long engineerId;
    private String engineerName;
    private String engineerEmail;

    private String status; // ACTIVE, COMPLETED, CANCELLED

    // === NEW: Core Identification ===
    private String code;
    private String industry; // Industry enum as string
    private String projectType; // ProjectType enum as string

    // === NEW: Owner Rep ===
    private String ownerRepName;
    private String ownerRepContact;

    // === NEW: Location Details ===
    private String plotNumber;
    private String gpsCoordinates;
    private Boolean titleDeedAvailable;
    private String siteAccessNotes;

    // === NEW: Project Context ===
    private String keyObjectives;
    private String expectedOutput;

    // === NEW: Timeline ===
    private java.time.LocalDate startDate;
    private java.time.LocalDate expectedCompletionDate;

    // === NEW: Contractual ===
    private String contractType; // ContractType enum as string
    private Integer defectsLiabilityPeriod;
    private Boolean performanceSecurityRequired;

    // === NEW: Summary counts ===
    private Integer teamCount;
    private Integer scopeCount;
    private Integer milestoneCount;
    private Integer documentCount;
}
