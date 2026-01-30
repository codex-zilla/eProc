package com.zilla.eproc.model;

/**
 * System-level roles for authentication and global access control.
 * These are distinct from ProjectRole which defines contextual authority
 * within a specific project.
 * 
 * - SYSTEM_ADMIN: Global system oversight (future)
 * - PROJECT_OWNER: Business owner who can create projects and manage staff
 * - ENGINEER: Technical staff who can self-register with ERB verification
 */
public enum Role {
    SYSTEM_ADMIN,
    PROJECT_OWNER,
    ENGINEER
}
