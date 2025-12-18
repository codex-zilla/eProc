package com.zilla.eproc.dto;

import com.zilla.eproc.model.RequestStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for approval/rejection actions on a material request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionDTO {

    @NotNull(message = "Status is required")
    private RequestStatus status;

    private String comment;

    /**
     * Validates that rejection requires a comment.
     */
    @AssertTrue(message = "Rejection requires a comment")
    public boolean isCommentProvidedForRejection() {
        if (status == RequestStatus.REJECTED) {
            return comment != null && !comment.trim().isEmpty();
        }
        return true;
    }

    /**
     * Validates that only APPROVED or REJECTED status can be set.
     */
    @AssertTrue(message = "Status must be APPROVED or REJECTED")
    public boolean isValidApprovalStatus() {
        return status == RequestStatus.APPROVED || status == RequestStatus.REJECTED;
    }
}
