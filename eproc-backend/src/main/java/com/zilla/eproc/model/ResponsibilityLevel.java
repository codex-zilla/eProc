package com.zilla.eproc.model;

/**
 * Responsibility level for project assignments.
 * Defines the scope of authority a user has within their project role.
 */
public enum ResponsibilityLevel {
    /** Full authority - can approve, submit, and make decisions */
    FULL,
    /** Limited authority - can submit but not approve */
    LIMITED,
    /** Read-only access - can view but not modify */
    OBSERVER
}
