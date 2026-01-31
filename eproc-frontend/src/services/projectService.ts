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
  }
};
