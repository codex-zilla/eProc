package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for detailed duplicate material information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateMaterialInfoDTO {
    private String materialName;
    private BigDecimal originalQuantity;
    private LocalDateTime originalStartDate;
    private LocalDateTime originalEndDate;
    private BigDecimal currentQuantity;
    private LocalDateTime currentStartDate;
    private LocalDateTime currentEndDate;
}
