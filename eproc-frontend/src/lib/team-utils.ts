import type { ProjectAssignment } from '@/types/models';
import { ProjectRole } from '@/types/models';

export const TEAM_ROLE_ORDER: Record<string, number> = {
    'PROJECT_OWNER': 1,
    'PROJECT_MANAGER': 2,
    'PROJECT_ACCOUNTANT': 3,
    'PROJECT_LEAD_ENGINEER': 4,
    'PROJECT_SITE_ENGINEER': 5,
    'PROJECT_CONSULTANT_ENGINEER': 6,
    'ENGINEER': 7,
};

/**
 * Formats a raw backend role string into a clean frontend label
 * Uses the ProjectRole constant values which have stripped the redundant PROJECT_ prefixes
 */
export const formatRole = (role: string): string => {
    // Attempt to map raw backend keys (e.g. PROJECT_LEAD_ENGINEER) to the clean enum values
    const mappedRole = (ProjectRole as Record<string, string>)[role] || role;
    return mappedRole.replace(/_/g, ' ');
};

/**
 * Sorts an array of ProjectAssignments by their defined role hierarchy.
 */
export const sortTeamMembers = (team: ProjectAssignment[]): ProjectAssignment[] => {
    return [...team].sort((a, b) => {
        const orderA = TEAM_ROLE_ORDER[a.role] || 99;
        const orderB = TEAM_ROLE_ORDER[b.role] || 99;
        return orderA - orderB;
    });
};
