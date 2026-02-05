package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for attachment information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String storagePath;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
