package com.zilla.eproc.dto;

import com.zilla.eproc.model.MaterialStatus;
import com.zilla.eproc.model.RateEstimateType;
import com.zilla.eproc.model.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Material item response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialItemResponseDTO {

    private Long id;
    private String name;
    private BigDecimal quantity;
    private String measurementUnit;
    private BigDecimal rateEstimate;
    private RateEstimateType rateEstimateType;
    private ResourceType resourceType;
    private MaterialStatus status;
    private String comment;
    private Integer revisionNumber;
    private BigDecimal totalEstimate;
    private LocalDateTime createdAt;
}
