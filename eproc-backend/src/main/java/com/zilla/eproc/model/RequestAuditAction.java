package com.zilla.eproc.model;

/**
 * Actions that can be logged in the request audit trail.
 */
public enum RequestAuditAction {
    CREATED, // Request first created
    SUBMITTED, // Request submitted for approval
    APPROVED, // Request approved by PM
    REJECTED, // Request rejected by PM
    UPDATED, // Request edited (any field change)
    RESUBMITTED // Rejected request resubmitted
}
