package com.zilla.eproc.model;

/**
 * Project lifecycle status.
 * ACTIVE - Project is currently active and can receive requests
 * COMPLETED - Project is finished (engineer becomes available for new projects)
 * CANCELLED - Project was cancelled (engineer becomes available for new
 * projects)
 */
public enum ProjectStatus {
    ACTIVE,
    COMPLETED,
    CANCELLED
}
