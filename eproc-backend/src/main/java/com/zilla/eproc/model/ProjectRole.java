package com.zilla.eproc.model;

/**
 * Roles that can be assigned to users within a specific project.
 * This is different from the global User.role (system role).
 * ProjectRole defines what authority a user has ON A SPECIFIC PROJECT.
 */
public enum ProjectRole {
    LEAD_ENGINEER,
    CIVIL_ENGINEER,
    ELECTRICAL_ENGINEER,
    MECHANICAL_ENGINEER,
    SITE_ENGINEER,
    PROJECT_MANAGER,
    QUANTITY_SURVEYOR,
    CLERK_OF_WORKS
}
