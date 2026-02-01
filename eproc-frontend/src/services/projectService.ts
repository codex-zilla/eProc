import axiosInstance from '../lib/axios';
import type { 
    Project, 
    Site, 
    ProjectAssignment, 
    CreateAssignmentRequest,
    UserSummary
} from '../types/models';

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
      const response = await axiosInstance.get(`/projects/${id}`);
      return response.data;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  },

  updateProjectStatus: async (id: number, status: string): Promise<Project> => {
      const response = await axiosInstance.patch(`/projects/${id}/status`, { status });
      return response.data;
  },

  getAllSites: async (): Promise<Site[]> => {
    const response = await axiosInstance.get('/sites');
    return response.data;
  },

  getSitesByProject: async (projectId: number): Promise<Site[]> => {
    const response = await axiosInstance.get(`/sites/project/${projectId}`);
    return response.data;
  },

  createSite: async (data: Partial<Site>): Promise<Site> => {
    const response = await axiosInstance.post('/sites', data);
    return response.data;
  },

  // === Team Management ===
  getProjectTeam: async (projectId: number): Promise<ProjectAssignment[]> => {
      const response = await axiosInstance.get(`/projects/${projectId}/team`);
      return response.data;
  },

  addTeamMember: async (projectId: number, request: CreateAssignmentRequest): Promise<ProjectAssignment> => {
      const response = await axiosInstance.post(`/projects/${projectId}/team`, request);
      return response.data;
  },

  removeTeamMember: async (projectId: number, assignmentId: number): Promise<void> => {
      await axiosInstance.delete(`/projects/${projectId}/team/${assignmentId}`);
  },

  updateTeamMember: async (projectId: number, assignmentId: number, request: Partial<CreateAssignmentRequest>): Promise<ProjectAssignment> => {
      const response = await axiosInstance.patch(`/projects/${projectId}/team/${assignmentId}`, request);
      return response.data;
  },

  getAvailableEngineers: async (): Promise<UserSummary[]> => {
      const response = await axiosInstance.get('/projects/available-engineers');
      return response.data;
  },

  // === Project-Bound User Management ===
  // Create a new user account (PROJECT_MANAGER or PROJECT_ACCOUNTANT)
  createProjectUser: async (data: {
    name: string;
    email: string;
    role: string;
    projectId: number;
    phoneNumber?: string;
    startDate: string;
    responsibilityLevel?: string;
  }): Promise<any> => {
      const response = await axiosInstance.post('/project-users', data);
      return response.data;
  },

  // Get all users created by current owner
  getMyProjectUsers: async (): Promise<any[]> => {
      const response = await axiosInstance.get('/project-users');
      return response.data;
  },

  // Assign existing user to a project
  assignUserToProject: async (userId: number, projectId: number, role: string, startDate: string, responsibilityLevel: string = 'FULL'): Promise<any> => {
      const response = await axiosInstance.post(`/project-users/${userId}/assign`, null, {
          params: { projectId, role, startDate, responsibilityLevel }
      });
      return response.data;
  },

  // Remove user from a project (soft delete assignment)
  removeUserFromProject: async (userId: number, projectId: number): Promise<void> => {
      await axiosInstance.delete(`/project-users/${userId}/projects/${projectId}`);
  },

  // Update user details (name, email, phone)
  updateUser: async (userId: number, data: {
    name: string;
    email: string;
    phoneNumber?: string;
  }): Promise<any> => {
      const response = await axiosInstance.patch(`/project-users/${userId}`, data);
      return response.data;
  },

  // Delete user completely (soft delete)
  deleteUser: async (userId: number): Promise<void> => {
      await axiosInstance.delete(`/project-users/${userId}`);
  }
};
