package com.zilla.eproc.model;

/**
 * Status values for BOQ Batches.
 */
public enum BatchStatus {
    /**
     * Draft - not yet submitted for approval.
     */
    DRAFT,

    /**
     * Submitted and awaiting review.
     */
    SUBMITTED,

    /**
     * Some items approved, some rejected.
     */
    PARTIALLY_APPROVED,

    /**
     * All items approved.
     */
    APPROVED,

    /**
     * All items rejected or batch rejected entirely.
     */
    REJECTED,

    /**
     * Batch is closed/archived (immutable).
     */
    CLOSED
}
