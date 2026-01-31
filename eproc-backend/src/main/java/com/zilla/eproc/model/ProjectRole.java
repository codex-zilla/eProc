package com.zilla.eproc.model;

/**
 * Contextual roles that can be assigned to users within a specific project.
 * This is different from the global Role (system role).
 * ProjectRole defines what authority a user has ON A SPECIFIC PROJECT.
 * 
 * Core roles:
 * - OWNER: Immutable role for the project creator (cannot be removed)
 * - PROJECT_MANAGER: Management authority for a specific project
 * - PROJECT_ACCOUNTANT: Financial authority for a specific project
 * - ENGINEER: Generic technical role
 * 
 * Specific engineer types (for detailed role tracking):
 * - LEAD_ENGINEER, SITE_ENGINEER, CONSULTANT_ENGINEER
 */
public enum ProjectRole {
    // Core contextual roles
    OWNER,
    PROJECT_MANAGER,
    PROJECT_ACCOUNTANT,

    // Specific engineer types
    LEAD_ENGINEER,
    SITE_ENGINEER,
    CONSULTANT_ENGINEER
}
