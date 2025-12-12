package com.zilla.eproc.dto;

import com.zilla.eproc.model.MaterialCategory;
import com.zilla.eproc.model.MaterialUnit;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialDTO {
    private Long id;
    private String name;
    private MaterialCategory category;
    private MaterialUnit defaultUnit;
    private String unitType;
    private BigDecimal referencePrice;
    private Boolean isActive;
}
