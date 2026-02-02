package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;

    @Deprecated
    private String ownerEmail; // Legacy - kept for backward compatibility

    private String currency;
    private BigDecimal budgetTotal;
    private String description;
    private String siteLocation;
    private String region;
    private String district;
    private String ward;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Project Owner (User relationship)
    private Long ownerId;
    private String ownerName;

    private String status; // ACTIVE, COMPLETED, CANCELLED

    // === Core Identification ===
    private String code;
    private String industry; // Industry enum as string
    private String projectType; // ProjectType enum as string

    // === Owner Representative (the client's contact person) ===
    private String ownerRepName;
    private String ownerRepContact;

    // === Location Details ===
    private String plotNumber;
    private String gpsCoordinates;
    private Boolean titleDeedAvailable;
    private String siteAccessNotes;

    // === Project Context ===
    private String keyObjectives;
    private String expectedOutput;

    // === Timeline ===
    private java.time.LocalDate startDate;
    private java.time.LocalDate expectedCompletionDate;

    // === Contractual ===
    private String contractType; // ContractType enum as string
    private Integer defectsLiabilityPeriod;
    private Boolean performanceSecurityRequired;

    // === Summary counts ===
    private Integer teamCount;
    private Integer scopeCount;
    private Integer milestoneCount;
    private Integer documentCount;

    // === Multi-Site Creation ===
    private List<SiteDTO> initialSites;
}
