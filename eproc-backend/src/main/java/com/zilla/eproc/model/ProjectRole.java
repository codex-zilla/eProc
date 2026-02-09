package com.zilla.eproc.model;

/**
 * Contextual roles that can be assigned to users within a specific project.
 * This is different from the global Role (system role).
 * ProjectRole defines what authority a user has ON A SPECIFIC PROJECT.
 * All roles have a PROJECT_ prefix to distinguish from system roles.
 * 
 * Core roles:
 * - PROJECT_OWNER: Immutable role for the project creator (cannot be removed)
 * - PROJECT_MANAGER: Management authority for a specific project
 * - PROJECT_ACCOUNTANT: Financial authority for a specific project
 * 
 * Specific engineer types (for detailed role tracking):
 * - PROJECT_LEAD_ENGINEER, PROJECT_SITE_ENGINEER, PROJECT_CONSULTANT_ENGINEER
 */
public enum ProjectRole {
    // Core contextual roles
    PROJECT_OWNER,
    PROJECT_MANAGER,
    PROJECT_ACCOUNTANT,

    // Specific engineer types
    PROJECT_LEAD_ENGINEER,
    PROJECT_SITE_ENGINEER,
    PROJECT_CONSULTANT_ENGINEER
}
