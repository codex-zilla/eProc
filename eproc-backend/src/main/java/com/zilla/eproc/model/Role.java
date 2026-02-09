package com.zilla.eproc.model;

/**
 * System-level roles for authentication and global access control.
 * These roles determine which dashboard/UI a user sees and their
 * global capabilities. They are distinct from ProjectRole which
 * defines contextual authority within a specific project.
 * 
 * - ADMIN: Global system administrator (future use)
 * - OWNER: Business owner who can create projects and manage staff
 * - MANAGER: Manager role, routed to manager dashboard
 * - ACCOUNTANT: Accountant role, routed to accountant dashboard
 * - ENGINEER: Technical staff who can self-register with ERB verification
 */
public enum Role {
    ADMIN,
    OWNER,
    MANAGER,
    ACCOUNTANT,
    ENGINEER
}
