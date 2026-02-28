import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRequests } from '@/hooks/queries/useRequests';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import type { RequestDetail } from '@/types/models';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RequestSortField = 'date' | 'priority' | 'amount';
export type SortOrder = 'asc' | 'desc';

/** All valid values for the status filter pill, including the 'ALL' sentinel. */
export const REQUEST_STATUS_VALUES = [
  'ALL',
  'PENDING',
  'APPROVED',
  'PARTIALLY_APPROVED',
  'REJECTED',
] as const;
export type RequestStatusFilter = (typeof REQUEST_STATUS_VALUES)[number];

interface RequestFilters {
  status: RequestStatusFilter;
  sortField: RequestSortField;
  sortOrder: SortOrder;
}

// Priority lookup shared with the sort comparator
const PRIORITY_WEIGHT: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

const getPriority = (req: RequestDetail): string => req.priority || 'LOW';

export interface UseRequestListReturn {
  /** Raw request list from the server. */
  requests: RequestDetail[];
  /** Filtered + sorted requests (pre-grouping). */
  processedRequests: RequestDetail[];
  /** Requests grouped by project name, ready to render. */
  groupedRequests: Record<string, RequestDetail[]>;
  /** Which project groups are currently expanded. */
  expandedProjects: Record<string, boolean>;
  /** Toggle a project group open or closed. */
  toggleProject: (projectName: string) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  /** Raw search string — bind directly to the search input value. */
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  /** Current filter values (status, sortField, sortOrder). */
  filters: RequestFilters;
  /** Update a single filter key without touching the others. */
  setFilter: <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) => void;
  /** Count of requests per status pill (including ALL). */
  statusCounts: Record<RequestStatusFilter, number>;
  /** True when any filter or search is active. */
  isFiltered: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * `useRequestList` — encapsulates all data-fetching, filtering, searching,
 * sorting, and project-group expand/collapse logic for the request list UI.
 *
 * Reuses:
 * - `useRequests`   — React Query data layer
 * - `useFilters`    — generic filter-state bag for status / sort field / sort order
 * - `useDebounce`   — delays the search term (300 ms)
 */
export function useRequestList(): UseRequestListReturn {
  const { data: requests = [], isLoading, error, refetch } = useRequests();

  // --- Search ---------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // --- Filters (status + sort) -----------------------------------------------
  const { filters, setFilter } = useFilters<RequestFilters>({
    status: 'ALL',
    sortField: 'date',
    sortOrder: 'desc',
  });

  // --- Derived: filtered + sorted list -------------------------------------
  const processedRequests = useMemo(() => {
    let result = requests.filter((req) => {
      // Status filter
      if (filters.status !== 'ALL' && req.status !== filters.status) return false;

      // Search filter (debounced)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const title = (req.title || 'BOQ Request').toLowerCase();
        const matchesTitle = title.includes(q);
        const matchesSite = (req.siteName || '').toLowerCase().includes(q);
        const matchesRequester = (req.createdByName || '').toLowerCase().includes(q);
        const matchesProject = (req.projectName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSite && !matchesRequester && !matchesProject) return false;
      }

      return true;
    });

    // Sort
    return [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortField) {
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          cmp = (a.totalValue || 0) - (b.totalValue || 0);
          break;
        case 'priority':
          cmp = (PRIORITY_WEIGHT[getPriority(a)] || 0) - (PRIORITY_WEIGHT[getPriority(b)] || 0);
          break;
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [requests, debouncedSearch, filters]);

  // --- Derived: group by project name ---------------------------------------
  const groupedRequests = useMemo(() => {
    const groups: Record<string, RequestDetail[]> = {};
    processedRequests.forEach((req) => {
      const project = req.projectName || 'Unassigned Projects';
      if (!groups[project]) groups[project] = [];
      groups[project].push(req);
    });
    return groups;
  }, [processedRequests]);

  // --- Expand / collapse state ----------------------------------------------
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Initialise all groups as expanded once data first arrives
  useEffect(() => {
    if (requests.length > 0 && Object.keys(expandedProjects).length === 0) {
      const projectNames = new Set(requests.map((r) => r.projectName || 'Unassigned Projects'));
      setExpandedProjects(
        Array.from(projectNames).reduce<Record<string, boolean>>(
          (acc, name) => ({ ...acc, [name]: true }),
          {}
        )
      );
    }
  }, [requests]);

  const toggleProject = useCallback((projectName: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projectName]: !prev[projectName] }));
  }, []);

  // --- Derived: status pill counts -----------------------------------------
  const statusCounts = useMemo<Record<RequestStatusFilter, number>>(() => {
    const counts = { ALL: requests.length } as Record<RequestStatusFilter, number>;
    for (const s of REQUEST_STATUS_VALUES.filter((v) => v !== 'ALL')) {
      counts[s] = requests.filter((r) => r.status === s).length;
    }
    return counts;
  }, [requests]);

  const isFiltered = debouncedSearch !== '' || filters.status !== 'ALL';

  return {
    requests,
    processedRequests,
    groupedRequests,
    expandedProjects,
    toggleProject,
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
