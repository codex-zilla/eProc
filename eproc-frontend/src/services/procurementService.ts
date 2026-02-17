import api from '../lib/axios';

// ================== DTOs ==================

export interface CreatePurchaseOrderItemDTO {
  requestId: number;
  materialDisplayName: string;
  orderedQty: number;
  unit: string;
  unitPrice: number;
}

export interface CreatePurchaseOrderDTO {
  projectId: number;
  siteId?: number;
  vendorName?: string;
  notes?: string;
  items: CreatePurchaseOrderItemDTO[];
}

import type { PurchaseOrder, PurchaseOrderItem } from '@/types/models';

export type PurchaseOrderItemResponse = PurchaseOrderItem;


export type PurchaseOrderResponse = PurchaseOrder;


export interface DeliveryItemDTO {
  purchaseOrderItemId: number;
  quantityDelivered: number;
  condition: 'GOOD' | 'DAMAGED' | 'PARTIAL_DAMAGE' | 'OTHER';
  notes?: string;
}

export interface CreateDeliveryDTO {
  purchaseOrderId: number;
  deliveredDate?: string;
  notes?: string;
  items: DeliveryItemDTO[];
}

export interface DeliveryItemResponse {
  id: number;
  purchaseOrderItemId: number;
  materialDisplayName: string;
  quantityDelivered: number;
  condition: 'GOOD' | 'DAMAGED' | 'PARTIAL_DAMAGE' | 'OTHER';
  notes?: string;
}

export interface DeliveryResponse {
  id: number;
  purchaseOrderId: number;
  poNumber: string;
  deliveredDate: string;
  notes?: string;
  createdAt: string;
  receivedByName: string;
  receivedById: number;
  items: DeliveryItemResponse[];
}

// ================== Service Functions ==================

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = async (
  dto: CreatePurchaseOrderDTO
): Promise<PurchaseOrderResponse> => {
  const response = await api.post('/purchase-orders', dto);
  return response.data;
};

/**
 * Get all purchase orders for a project
 */
export const getProjectPurchaseOrders = async (
  projectId: number
): Promise<PurchaseOrderResponse[]> => {
  const response = await api.get(`/purchase-orders/project/${projectId}`);
  return response.data;
};

/**
 * Get a single purchase order by ID
 */
export const getPurchaseOrder = async (
  id: number
): Promise<PurchaseOrderResponse> => {
  const response = await api.get(`/purchase-orders/${id}`);
  return response.data;
};

/**
 * Record a new delivery
 */
export const recordDelivery = async (
  dto: CreateDeliveryDTO
): Promise<DeliveryResponse> => {
  const response = await api.post('/deliveries', dto);
  return response.data;
};

/**
 * Get all deliveries for a purchase order
 */
export const getDeliveriesForPO = async (
  poId: number
): Promise<DeliveryResponse[]> => {
  const response = await api.get(`/deliveries/purchase-order/${poId}`);
  return response.data;
};

/**
 * Close a purchase order
 */
export const closePurchaseOrder = async (
  id: number
): Promise<PurchaseOrderResponse> => {
  const response = await api.post(`/purchase-orders/${id}/close`);
  return response.data;
};
