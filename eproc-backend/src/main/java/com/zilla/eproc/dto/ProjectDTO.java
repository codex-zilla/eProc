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
}
