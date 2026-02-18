import api from '../lib/axios';
import type { MaterialRequest, CreateMaterialRequest, ApprovalAction, RequestStatus, RequestDetail, AuditEntry } from '../types/models';

/**
 * Service for material request API operations.
 */
export const requestService = {
  /**
   * Create a new material request.
   */
  createRequest: async (data: CreateMaterialRequest): Promise<MaterialRequest> => {
    const response = await api.post<MaterialRequest>('/requests', data);
    return response.data;
  },

  /**
   * Create multiple material requests (batch).
   */
  createBatchRequests: async (data: CreateMaterialRequest[]): Promise<MaterialRequest[]> => {
    const response = await api.post<MaterialRequest[]>('/requests', data);
    return response.data;
  },

  /**
   * Get all requests with optional filters.
   */
  getRequests: async (params?: {
    status?: RequestStatus;
    siteId?: number;
    projectId?: number;
    myRequests?: boolean;
  }): Promise<RequestDetail[]> => {
    const response = await api.get<RequestDetail[]>('/requests', { params });
    return response.data;
  },

  /**
   * Get pending requests (for PM approval queue).
   */
  getPendingRequests: async (): Promise<MaterialRequest[]> => {
    const response = await api.get<MaterialRequest[]>('/requests/pending');
    return response.data;
  },

  getMyRequests: async (): Promise<MaterialRequest[]> => {
    const response = await api.get<MaterialRequest[]>('/requests/my-requests');
    return response.data;
  },

  /**
   * Get requests for a specific project.
   */
  getProjectRequests: async (projectId: number): Promise<RequestDetail[]> => {
    const response = await api.get<RequestDetail[]>(`/requests/project/${projectId}`);
    return response.data;
  },

  /**
   * Get a single request by ID.
   */
  getRequestById: async (id: number): Promise<RequestDetail> => {
    const response = await api.get<RequestDetail>(`/requests/${id}`);
    return response.data;
  },

  /**
   * Update a rejected request (resubmit).
   */
  updateRequest: async (id: number, data: CreateMaterialRequest): Promise<MaterialRequest> => {
    const response = await api.put<MaterialRequest>(`/requests/${id}`, data);
    return response.data;
  },

  /**
   * Approve or reject a request.
   */
  processApproval: async (id: number, action: ApprovalAction): Promise<MaterialRequest> => {
    const response = await api.patch<MaterialRequest>(`/requests/${id}/status`, action);
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

  /**
   * Update material status (approve/reject).
   */
  updateMaterialStatus: async (requestId: number, materialId: number, status: string, comment?: string): Promise<void> => {
    await api.patch(`/requests/${requestId}/materials/${materialId}/status`, { status, comment });
  },

  /**
   * Update a specific material details within a request.
   */
  updateMaterial: async (requestId: number, materialId: number, data: any): Promise<void> => {
    await api.patch(`/requests/${requestId}/materials/${materialId}`, data);
  },

  /**
   * Get request history/audit logs.
   */
  getRequestHistory: async (id: number): Promise<AuditEntry[]> => {
    const response = await api.get<AuditEntry[]>(`/requests/${id}/history`);
    return response.data;
  },
};

