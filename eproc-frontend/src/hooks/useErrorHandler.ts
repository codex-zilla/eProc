/**
 * Unified error handling hook for the eProc application
 * 
 * This hook provides consistent error handling across the application by:
 * - Showing appropriate toast messages for different error types
 * - Handling validation errors (400-level)
 * - Deferring to axios interceptor for network/server errors (handled globally)
 * 
 * This replaces 20+ duplicate manual error handling patterns across the codebase.
 */

import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
  details?: string[];
}

/**
 * Custom hook for consistent error handling
 * 
 * @returns Object with handleError function
 * 
 * @example
 * const { handleError } = useErrorHandler();
 * 
 * try {
 *   await requestService.create(data);
 * } catch (error) {
 *   handleError(error, 'Failed to create request');
 * }
 */
export const useErrorHandler = () => {
  const handleError = (
    error: unknown,
    fallbackMessage: string = 'An error occurred'
  ) => {
    // Network errors and 500+ errors are handled by axios interceptor
    // We only handle validation/client errors (400-level) here
    
    if (error && typeof error === 'object' && 'code' in error) {
      const axiosError = error as AxiosError;
      
      // Network errors - interceptor handles these, don't show duplicate toast
      if (axiosError.code === 'ERR_NETWORK') {
        return;
      }
      
      // Server errors (500+) - interceptor handles these
      if (axiosError.response?.status && axiosError.response.status >= 500) {
        return;
      }
      
      // Validation/client errors (400-level) - show specific message
      if (
        axiosError.response?.status &&
        axiosError.response.status >= 400 &&
        axiosError.response.status < 500
      ) {
        const errorData = axiosError.response.data as ErrorResponse;
        const message = errorData?.message || errorData?.error || fallbackMessage;
        
        toast.error(fallbackMessage, {
          description: message,
          duration: 5000,
        });
        return;
      }
    }
    
    // Generic error fallback
    toast.error(fallbackMessage, {
      description: 'Please try again or contact support if the problem persists.',
      duration: 5000,
    });
  };

  return { handleError };
};
