/**
 * Integration tests for useErrorHandler hook
 * Target: 85% coverage
 */

import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show toast for 400-level validation errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 400,
        data: { message: 'Invalid input data' },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Failed to save');
    
    expect(toast.error).toHaveBeenCalledWith('Failed to save', {
      description: 'Invalid input data',
      duration: 5000,
    });
  });

  it('should use fallback message when error message not provided', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 400,
        data: {},
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Operation failed');
    
    expect(toast.error).toHaveBeenCalledWith('Operation failed', {
      description: 'Operation failed',
      duration: 5000,
    });
  });

  it('should handle 404 errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 404,
        data: { message: 'Resource not found' },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Failed to load resource');
    
    expect(toast.error).toHaveBeenCalledWith('Failed to load resource', {
      description: 'Resource not found',
      duration: 5000,
    });
  });

  it('should NOT show toast for network errors (handled by interceptor)', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_NETWORK',
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Network failed');
    
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should NOT show toast for 500+ server errors (handled by interceptor)', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_SERVER',
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Server error');
    
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should handle 503 service unavailable (defer to interceptor)', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_SERVER',
      response: {
        status: 503,
        data: { message: 'Service unavailable' },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Service error');
    
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should handle generic errors with fallback message', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Something went wrong');
    
    result.current.handleError(error, 'Operation failed');
    
    expect(toast.error).toHaveBeenCalledWith('Operation failed', {
      description: 'Please try again or contact support if the problem persists.',
      duration: 5000,
    });
  });

  it('should use default fallback when no message provided', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Generic error');
    
    result.current.handleError(error);
    
    expect(toast.error).toHaveBeenCalledWith('An error occurred', {
      description: 'Please try again or contact support if the problem persists.',
      duration: 5000,
    });
  });

  it('should handle error.error field in response data', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 422,
        data: { error: 'Validation failed' },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Validation error');
    
    expect(toast.error).toHaveBeenCalledWith('Validation error', {
      description: 'Validation failed',
      duration: 5000,
    });
  });

  it('should prioritize message over error field', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = {
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 400,
        data: {
          message: 'Message field',
          error: 'Error field',
        },
      },
      isAxiosError: true,
    } as unknown as AxiosError;
    
    result.current.handleError(error, 'Failed');
    
    expect(toast.error).toHaveBeenCalledWith('Failed', {
      description: 'Message field',
      duration: 5000,
    });
  });
});
