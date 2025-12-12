package com.example.eproc_backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkPackageDTO {
    private Long id;
    private Long siteId;
    private String name;
    private String stage;
    private Boolean isActive;
}
