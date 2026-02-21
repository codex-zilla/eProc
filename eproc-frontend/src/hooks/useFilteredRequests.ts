import { useMemo } from 'react';
import type { RequestDetail } from '@/types/models';

/**
 * Custom hook to encapsulate the derived state logic for filtering lists of requests on the client side.
 * Keeps components cleaner by moving out complex filter condition chains.
 *
 * @param requests - The source array of requests (usually from a React Query data fetch)
 * @param debouncedSearch - The debounced search string for text matching
 * @returns The filtered array of requests
 */
export function useFilteredRequests(
    requests: RequestDetail[],
    debouncedSearch: string,
) {
    return useMemo(() => {
        if (!requests || requests.length === 0) return [];

        return requests.filter(req => {
            // Search Filter
            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                const matchesSearch =
                    req.title.toLowerCase().includes(searchLower) ||
                    req.projectName?.toLowerCase().includes(searchLower) ||
                    req.createdByName?.toLowerCase().includes(searchLower) ||
                    req.materials?.some(item => item.name.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;
            }

            return true;
        });
    }, [requests, debouncedSearch]);
}
