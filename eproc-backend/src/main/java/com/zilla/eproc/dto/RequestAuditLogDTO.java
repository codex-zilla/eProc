package com.zilla.eproc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Request Audit Log response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestAuditLogDTO {

    private Long id;
    private String action;
    private String statusSnapshot;
    private String comment;
    private LocalDateTime timestamp;
    private String actorName;
    private String actorEmail;
    private String actorRole;
}
