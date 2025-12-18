package com.zilla.eproc.model;

/**
 * Status of a material request in the approval workflow.
 */
public enum RequestStatus {
    /**
     * Request is awaiting approval from Project Manager.
     */
    PENDING,

    /**
     * Request has been approved by Project Manager.
     */
    APPROVED,

    /**
     * Request has been rejected by Project Manager.
     * Engineer can edit and resubmit.
     */
    REJECTED
}
