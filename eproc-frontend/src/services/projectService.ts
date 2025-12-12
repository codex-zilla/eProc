import axiosInstance from '../lib/axios';
import { Project, Site } from '../types/models';

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await axiosInstance.post('/projects', data);
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
  }
};
