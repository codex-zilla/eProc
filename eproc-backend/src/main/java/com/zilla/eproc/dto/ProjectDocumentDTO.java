package com.zilla.eproc.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ProjectDocument entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDocumentDTO {
    private Long id;
    private Long projectId;
    private String name;
    private String type; // DocumentType enum as string
    private String url;
    private Integer version;
    private String status; // DocumentStatus enum as string
    private Long uploadedById;
    private String uploadedByName;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
