package com.example.eproc_backend.dto;

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
    private String owner;
    private String currency;
    private BigDecimal budgetTotal;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
