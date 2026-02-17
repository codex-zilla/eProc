import { useMemo } from 'react';
import type { PurchaseOrder } from '@/types/models';
import type { DatePreset } from '@/components/common/DateRangePicker';

export interface POFilters {
    status: 'ALL' | 'OPEN' | 'CLOSED';
    project: number | 'ALL';
    search: string;
    dateRange: { start: string; end: string };
    datePreset: DatePreset;
}

export function useFilteredPurchaseOrders(
    purchaseOrders: PurchaseOrder[],
    filters: POFilters,
    debouncedSearch: string
) {
    return useMemo(() => {
        let filtered = [...purchaseOrders];

        // Status Filter
        if (filters.status !== 'ALL') {
            filtered = filtered.filter(po => po.status === filters.status);
        }

        // Project Filter
        if (filters.project !== 'ALL') {
            filtered = filtered.filter(po => po.projectId === filters.project);
        }

        // Search Filter
        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(query) ||
                po.projectName.toLowerCase().includes(query) ||
                (po.siteName || '').toLowerCase().includes(query) ||
                po.createdByName.toLowerCase().includes(query)
            );
        }

        // Date Range Filter
        if (filters.dateRange.start) {
            filtered = filtered.filter(po => new Date(po.createdAt) >= new Date(filters.dateRange.start));
        }
        if (filters.dateRange.end) {
            const endOfDay = new Date(filters.dateRange.end);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter(po => new Date(po.createdAt) <= endOfDay);
        }

        return filtered;
    }, [purchaseOrders, filters.status, filters.project, debouncedSearch, filters.dateRange]);
}
