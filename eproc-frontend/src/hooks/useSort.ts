import { useState, useCallback } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface UseSortReturn<T> {
  sortConfig: SortConfig | null;
  handleSort: (key: string) => void;
  sortItems: (items: T[]) => T[];
  resetSort: () => void;
}

/**
 * Reusable hook for managing sort state and applying sort logic.
 * 
 * @param defaultKey - optional initial sort key
 * @param defaultDirection - initial direction (default: 'asc')
 * 
 * @example
 * const { sortConfig, handleSort, sortItems } = useSort<PurchaseOrderItem>('materialDisplayName');
 * const sorted = sortItems(items);
 */
export function useSort<T>(
  defaultKey?: string,
  defaultDirection: 'asc' | 'desc' = 'asc'
): UseSortReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultKey ? { key: defaultKey, direction: defaultDirection } : null
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const sortItems = useCallback(
    (items: T[]): T[] => {
      if (!sortConfig) return items;
      return [...items].sort((a, b) => {
        const aVal = (a as any)[sortConfig.key] ?? '';
        const bVal = (b as any)[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    },
    [sortConfig]
  );

  const resetSort = useCallback(() => {
    setSortConfig(
      defaultKey ? { key: defaultKey, direction: defaultDirection } : null
    );
  }, [defaultKey, defaultDirection]);

  return { sortConfig, handleSort, sortItems, resetSort };
}
