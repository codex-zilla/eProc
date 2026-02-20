/**
 * Centralized status badge utility functions for the eProc application
 * 
 * This module provides consistent Tailwind CSS classes for status badges across:
 * - Request statuses
 * - Purchase Order statuses
 * - Project statuses
 * 
 * These functions replace 8+ duplicate implementations across the codebase.
 */

/**
 * Request (BOQ) status types
 */
export type RequestStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED';

/**
 * Purchase Order status types
 */
export type POStatus = 'OPEN' | 'CLOSED' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'Ordered' | 'Partial' | 'Received';

/**
 * Project status types
 */
export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

/**
 * Get Tailwind CSS classes for Request status badges
 * 
 * @param status - The request status
 * @returns Tailwind CSS class string for badge styling
 * 
 * @example
 * getRequestStatusClass('PENDING') // "bg-amber-100 text-amber-800 border-amber-200"
 */
export const getRequestStatusClass = (status: RequestStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PARTIALLY_APPROVED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Get Tailwind CSS classes for Purchase Order status badges
 * 
 * @param status - The PO status
 * @returns Tailwind CSS class string for badge styling
 * 
 * @example
 * getPOStatusClass('OPEN') // "bg-blue-100 text-blue-800 border-blue-200"
 */
export const getPOStatusClass = (status: POStatus): string => {
  switch (status) {
    case 'OPEN':
    case 'Ordered':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CLOSED':
    case 'Received':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PARTIAL':
    case 'Partial':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ORDERED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'RECEIVED':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Get Tailwind CSS classes for Project status badges
 * 
 * @param status - The project status
 * @returns Tailwind CSS class string for badge styling
 * 
 * @example
 * getProjectStatusClass('ACTIVE') // "bg-green-100 text-green-800 border-green-200"
 */
export const getProjectStatusClass = (status: ProjectStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Get human-readable label for request status
 * 
 * @param status - The request status
 * @returns Human-readable status label
 * 
 * @example
 * getRequestStatusLabel('PARTIALLY_APPROVED') // "Partially Approved"
 */
export const getRequestStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'SUBMITTED':
      return 'Submitted';
    case 'APPROVED':
      return 'Approved';
    case 'PARTIALLY_APPROVED':
      return 'Partially Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};
