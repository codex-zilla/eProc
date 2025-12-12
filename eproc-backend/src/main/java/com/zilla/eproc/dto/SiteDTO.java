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
public class SiteDTO {
    private Long id;
    private Long projectId;
    private String name;
    private String location;
    private BigDecimal budgetCap;
    private String gpsCenter;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
