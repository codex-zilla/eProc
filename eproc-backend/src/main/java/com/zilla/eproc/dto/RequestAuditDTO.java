package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for audit trail entries in request history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestAuditDTO {
    private Long id;
    private String action;
    private String statusSnapshot;
    private String comment;
    private LocalDateTime timestamp;

    // Actor info
    private Long actorId;
    private String actorName;
    private String actorEmail;
    private String actorRole;
}
