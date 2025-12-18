import axios from 'axios';
import type { MaterialRequest, CreateMaterialRequest, ApprovalAction, RequestStatus } from '../types/models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Service for material request API operations.
 */
export const requestService = {
  /**
   * Create a new material request.
   */
  createRequest: async (data: CreateMaterialRequest): Promise<MaterialRequest> => {
    const response = await api.post<MaterialRequest>('/api/requests', data);
    return response.data;
  },

  /**
   * Get all requests with optional filters.
   */
  getRequests: async (params?: {
    status?: RequestStatus;
    siteId?: number;
    myRequests?: boolean;
  }): Promise<MaterialRequest[]> => {
    const response = await api.get<MaterialRequest[]>('/api/requests', { params });
    return response.data;
  },

  /**
   * Get pending requests (for PM approval queue).
   */
  getPendingRequests: async (): Promise<MaterialRequest[]> => {
    const response = await api.get<MaterialRequest[]>('/api/requests/pending');
    return response.data;
  },

  /**
   * Get current user's requests.
   */
  getMyRequests: async (): Promise<MaterialRequest[]> => {
    const response = await api.get<MaterialRequest[]>('/api/requests/my');
    return response.data;
  },

  /**
   * Get a single request by ID.
   */
  getRequestById: async (id: number): Promise<MaterialRequest> => {
    const response = await api.get<MaterialRequest>(`/api/requests/${id}`);
    return response.data;
  },

  /**
   * Update a rejected request (resubmit).
   */
  updateRequest: async (id: number, data: CreateMaterialRequest): Promise<MaterialRequest> => {
    const response = await api.put<MaterialRequest>(`/api/requests/${id}`, data);
    return response.data;
  },

  /**
   * Approve or reject a request.
   */
  processApproval: async (id: number, action: ApprovalAction): Promise<MaterialRequest> => {
    const response = await api.patch<MaterialRequest>(`/api/requests/${id}/status`, action);
    return response.data;
  },

  /**
   * Approve a request (convenience method).
   */
  approveRequest: async (id: number): Promise<MaterialRequest> => {
    return requestService.processApproval(id, { status: 'APPROVED' });
  },

  /**
   * Reject a request with comment.
   */
  rejectRequest: async (id: number, comment: string): Promise<MaterialRequest> => {
    return requestService.processApproval(id, { status: 'REJECTED', comment });
  },
};
