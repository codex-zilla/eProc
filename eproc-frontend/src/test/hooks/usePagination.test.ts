import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../hooks/usePagination';
import { describe, it, expect } from 'vitest';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasPreviousPage).toBe(true);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, initialPage: 2 }));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should set page size', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.setPageSize(20);
    });

    expect(result.current.pageSize).toBe(20);
    expect(result.current.totalPages).toBe(5);
  });

  it('should set specific page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should clamp page navigation', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, initialPageSize: 10 })); // 10 pages

    act(() => {
      result.current.setPage(15);
    });

    expect(result.current.currentPage).toBe(10);

    act(() => {
      result.current.setPage(0);
    });

    expect(result.current.currentPage).toBe(1);
  });
  
  it('should calculate correct start and end indices', () => {
     const { result } = renderHook(() => usePagination({ totalItems: 25, initialPage: 2, initialPageSize: 10 }));
     
     expect(result.current.startIndex).toBe(10);
     expect(result.current.endIndex).toBe(20);
  });

  it('should adjust current page if total items decrease such that page is out of bounds', () => {
      const { result, rerender } = renderHook((props) => usePagination(props), {
          initialProps: { totalItems: 100, initialPage: 10, initialPageSize: 10 }
      });
      
      expect(result.current.currentPage).toBe(10);
      
      rerender({ totalItems: 50, initialPage: 10, initialPageSize: 10 });
      
      expect(result.current.currentPage).toBe(5);
  });
});
