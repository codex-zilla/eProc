import { useState, useCallback } from 'react';

interface UseFiltersReturn<T> {
  filters: T;
  setFilter: (key: keyof T, value: any) => void;
  resetFilters: () => void;
  setFilters: (filters: T) => void;
}

/**
 * Hook to manage filter state.
 * 
 * @param initialState The initial state of the filters
 * @param syncWithUrl Whether to sync filters with URL search params (optional - future implementation)
 */
export function useFilters<T extends Record<string, any>>(
  initialState: T
): UseFiltersReturn<T> {
  const [filters, setFiltersState] = useState<T>(initialState);
  
  // Future: Implement URL sync logic here using useSearchParams if syncWithUrl is true

  const setFilter = useCallback((key: keyof T, value: any) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialState);
  }, [initialState]);

  const setFilters = useCallback((newFilters: T) => {
    setFiltersState(newFilters);
  }, []);

  return {
    filters,
    setFilter,
    resetFilters,
    setFilters,
  };
}
