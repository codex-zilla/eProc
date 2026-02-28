import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/queries/useProjects';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import type { Project } from '@/types/models';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortField = 'date' | 'budget' | 'name';
export type SortOrder = 'asc' | 'desc';

/** All valid values for the status filter pill, including the 'ALL' sentinel. */
export const PROJECT_STATUS_VALUES = ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;
export type ProjectStatusFilter = (typeof PROJECT_STATUS_VALUES)[number];

interface ProjectFilters {
  status: ProjectStatusFilter;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface UseProjectListReturn {
  /** Raw project list from the server (used to calculate pill counts). */
  projects: Project[];
  /** Post-filter + post-sort list — what the table/cards render. */
  processedProjects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  /** Raw search string — bind directly to the search <input> value. */
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  /** Current filter values (status, sortField, sortOrder). */
  filters: ProjectFilters;
  /** Update a single filter key without touching the others. */
  setFilter: <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => void;
  /** Number of projects per status (including 'ALL'). */
  statusCounts: Record<ProjectStatusFilter, number>;
  /** True when any search or status filter is active (useful for empty-state messages). */
  isFiltered: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * `useProjectList` — encapsulates all data-fetching, filtering, searching, and
 * sorting logic for the projects list UI.
 *
 * Reuses:
 * - `useProjects`  — React Query data layer
 * - `useFilters`   — generic filter-state bag for status / sort field / sort order
 * - `useDebounce`  — delays the search term so filtering runs at most every 300 ms
 *
 * `ProjectList.tsx` calls this hook and uses only the returned values for rendering.
 */
export function useProjectList(): UseProjectListReturn {
  const { data: projects = [], isLoading, error, refetch } = useProjects();

  // --- Search ---------------------------------------------------------------
  // Keep the raw value for the controlled input, debounce before filtering.
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // --- Filters (status + sort) ----------------------------------------------
  const { filters, setFilter } = useFilters<ProjectFilters>({
    status: 'ALL',
    sortField: 'date',
    sortOrder: 'desc',
  });

  // --- Derived: filtered + sorted list -------------------------------------
  const processedProjects = useMemo(() => {
    // 1. Status filter
    let result = projects.filter((p: Project) => {
      if (filters.status !== 'ALL' && p.status !== filters.status) return false;
      return true;
    });

    // 2. Search filter (debounced)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p: Project) => {
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.ownerName || '').toLowerCase().includes(q) ||
          (p.currency || '').toLowerCase().includes(q)
        );
      });
    }

    // 3. Sort
    return [...result].sort((a: Project, b: Project) => {
      let cmp = 0;
      switch (filters.sortField) {
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'budget':
          cmp = (a.budgetTotal || 0) - (b.budgetTotal || 0);
          break;
        case 'name':
          cmp = (a.name || '').localeCompare(b.name || '');
          break;
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [projects, debouncedSearch, filters]);

  // --- Derived: count per status pill ---------------------------------------
  const statusCounts = useMemo<Record<ProjectStatusFilter, number>>(() => {
    const counts = { ALL: projects.length } as Record<ProjectStatusFilter, number>;
    for (const s of PROJECT_STATUS_VALUES.filter((v) => v !== 'ALL')) {
      counts[s] = projects.filter((p) => p.status === s).length;
    }
    return counts;
  }, [projects]);

  // --- Helpers --------------------------------------------------------------
  const isFiltered = debouncedSearch !== '' || filters.status !== 'ALL';

  return {
    projects,
    processedProjects,
    isLoading,
    error: error as Error | null,
    refetch,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    statusCounts,
    isFiltered,
  };
}
