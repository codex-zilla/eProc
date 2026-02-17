import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../../hooks/useFilters';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('useFilters', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    children // Simplified wrapper, typically would wrap with Router but useFilters in current implemented state doesn't Strictly depend on router context unless syncWithUrl is active and robustly implemented.
             // However, the hook imports useSearchParams from 'react-router-dom', so we MUST provide a Router context.
  );
    
  it('should initialize with default filters', () => {
      const { result } = renderHook(() => useFilters({ status: 'all', search: '' }), {
          wrapper: MemoryRouter
      });

      expect(result.current.filters).toEqual({ status: 'all', search: '' });
  });

  it('should update single filter', () => {
      const { result } = renderHook(() => useFilters({ status: 'all', search: '' }), {
          wrapper: MemoryRouter
      });

      act(() => {
          result.current.setFilter('status', 'pending');
      });

      expect(result.current.filters).toEqual({ status: 'pending', search: '' });
  });

  it('should replace all filters', () => {
      const { result } = renderHook(() => useFilters({ status: 'all', search: '' }), {
          wrapper: MemoryRouter
      });

      act(() => {
          result.current.setFilters({ status: 'approved', search: 'test' });
      });

      expect(result.current.filters).toEqual({ status: 'approved', search: 'test' });
  });

  it('should reset filters', () => {
      const { result } = renderHook(() => useFilters({ status: 'all', search: '' }), {
          wrapper: MemoryRouter
      });

      act(() => {
          result.current.setFilter('status', 'pending');
      });
      
      expect(result.current.filters.status).toBe('pending');

      act(() => {
          result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({ status: 'all', search: '' });
  });
});
