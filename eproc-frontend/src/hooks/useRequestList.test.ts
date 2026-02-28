/**
 * Tests for useRequestList hook
 *
 * Covers:
 * - Loading / error state pass-through from useRequests
 * - Status filter (ALL + specific statuses)
 * - Search filtering (debounced, matches title / site / requester / project)
 * - Sort by date, priority, amount in asc + desc order
 * - Grouping by project name
 * - toggleProject expand/collapse
 * - statusCounts computed correctly
 * - isFiltered flag
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRequestList } from './useRequestList';

// ---------------------------------------------------------------------------
// Hoist mocks
// ---------------------------------------------------------------------------
const { useRequestsMock } = vi.hoisted(() => ({
    useRequestsMock: vi.fn(),
}));

vi.mock('./queries/useRequests', () => ({
    useRequests: useRequestsMock,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockRequests = [
    {
        id: 1,
        title: 'Alpha BOQ',
        projectName: 'Road Project',
        siteName: 'Site Alpha',
        createdByName: 'Jane Smith',
        status: 'PENDING',
        priority: 'HIGH',
        totalValue: 300_000,
        createdAt: '2024-01-01T00:00:00Z',
        plannedStartDate: null,
    },
    {
        id: 2,
        title: 'Beta BOQ',
        projectName: 'Road Project',
        siteName: 'Site Beta',
        createdByName: 'John Doe',
        status: 'APPROVED',
        priority: 'LOW',
        totalValue: 800_000,
        createdAt: '2024-03-15T00:00:00Z',
        plannedStartDate: null,
    },
    {
        id: 3,
        title: 'Gamma BOQ',
        projectName: 'Bridge Project',
        siteName: 'Site Gamma',
        createdByName: 'Alice Mwanga',
        status: 'REJECTED',
        priority: 'MEDIUM',
        totalValue: 150_000,
        createdAt: '2024-02-10T00:00:00Z',
        plannedStartDate: null,
    },
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('useRequestList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useRequestsMock.mockReturnValue({
            data: mockRequests,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });

    // --- Loading state -------------------------------------------------------
    it('returns isLoading:true while data is fetching', () => {
        useRequestsMock.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useRequestList());
        expect(result.current.isLoading).toBe(true);
        expect(result.current.processedRequests).toHaveLength(0);
    });

    // --- Error state ---------------------------------------------------------
    it('surfaces the error from useRequests', () => {
        const err = new Error('Network fail');
        useRequestsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: err,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useRequestList());
        expect(result.current.error).toBe(err);
    });

    // --- Default: all requests returned --------------------------------------
    it('returns all requests with no active filters', () => {
        const { result } = renderHook(() => useRequestList());
        expect(result.current.processedRequests).toHaveLength(3);
    });

    // --- Status filter -------------------------------------------------------
    it('filters to only PENDING requests when status is set', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('status', 'PENDING');
        });
        expect(result.current.processedRequests).toHaveLength(1);
        expect(result.current.processedRequests[0].title).toBe('Alpha BOQ');
    });

    it('filters to only APPROVED requests when status is APPROVED', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('status', 'APPROVED');
        });
        expect(result.current.processedRequests).toHaveLength(1);
        expect(result.current.processedRequests[0].title).toBe('Beta BOQ');
    });

    it('returns empty list when no requests match the selected status', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('status', 'PARTIALLY_APPROVED');
        });
        expect(result.current.processedRequests).toHaveLength(0);
    });

    // --- Search ---------------------------------------------------------------
    it('filters by request title (debounced)', async () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setSearchQuery('beta');
        });
        await waitFor(() => {
            expect(result.current.processedRequests).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedRequests[0].title).toBe('Beta BOQ');
    });

    it('filters by site name', async () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setSearchQuery('Site Gamma');
        });
        await waitFor(() => {
            expect(result.current.processedRequests).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedRequests[0].title).toBe('Gamma BOQ');
    });

    it('filters by requester name', async () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setSearchQuery('alice');
        });
        await waitFor(() => {
            expect(result.current.processedRequests).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedRequests[0].createdByName).toBe('Alice Mwanga');
    });

    it('filters by project name', async () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setSearchQuery('Bridge');
        });
        await waitFor(() => {
            expect(result.current.processedRequests).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedRequests[0].projectName).toBe('Bridge Project');
    });

    // --- Sort ----------------------------------------------------------------
    it('sorts by amount ascending', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('sortField', 'amount');
            result.current.setFilter('sortOrder', 'asc');
        });
        const amounts = result.current.processedRequests.map((r) => r.totalValue);
        expect(amounts).toEqual([150_000, 300_000, 800_000]);
    });

    it('sorts by amount descending', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('sortField', 'amount');
            result.current.setFilter('sortOrder', 'desc');
        });
        const amounts = result.current.processedRequests.map((r) => r.totalValue);
        expect(amounts).toEqual([800_000, 300_000, 150_000]);
    });

    it('sorts by priority ascending (LOW < MEDIUM < HIGH)', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('sortField', 'priority');
            result.current.setFilter('sortOrder', 'asc');
        });
        const priorities = result.current.processedRequests.map((r) => r.priority);
        expect(priorities).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    });

    it('sorts by date descending (most recent first)', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('sortField', 'date');
            result.current.setFilter('sortOrder', 'desc');
        });
        const ids = result.current.processedRequests.map((r) => r.id);
        // Beta (2024-03-15) > Gamma (2024-02-10) > Alpha (2024-01-01)
        expect(ids).toEqual([2, 3, 1]);
    });

    // --- Grouping ------------------------------------------------------------
    it('groups requests by project name', () => {
        const { result } = renderHook(() => useRequestList());
        const groups = result.current.groupedRequests;
        expect(Object.keys(groups)).toContain('Road Project');
        expect(Object.keys(groups)).toContain('Bridge Project');
        expect(groups['Road Project']).toHaveLength(2);
        expect(groups['Bridge Project']).toHaveLength(1);
    });

    it('labels requests without a project as "Unassigned Projects"', () => {
        useRequestsMock.mockReturnValue({
            data: [{ ...mockRequests[0], projectName: null }],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useRequestList());
        expect(Object.keys(result.current.groupedRequests)).toContain('Unassigned Projects');
    });

    // --- toggleProject -------------------------------------------------------
    it('toggleProject collapses an expanded group', async () => {
        const { result } = renderHook(() => useRequestList());
        // Wait for initial expansion
        await waitFor(() => {
            expect(result.current.expandedProjects['Road Project']).toBe(true);
        });
        act(() => {
            result.current.toggleProject('Road Project');
        });
        expect(result.current.expandedProjects['Road Project']).toBe(false);
    });

    // --- statusCounts --------------------------------------------------------
    it('computes correct statusCounts', () => {
        const { result } = renderHook(() => useRequestList());
        expect(result.current.statusCounts.ALL).toBe(3);
        expect(result.current.statusCounts.PENDING).toBe(1);
        expect(result.current.statusCounts.APPROVED).toBe(1);
        expect(result.current.statusCounts.REJECTED).toBe(1);
        expect(result.current.statusCounts.PARTIALLY_APPROVED).toBe(0);
    });

    // --- isFiltered flag -----------------------------------------------------
    it('isFiltered is false by default', () => {
        const { result } = renderHook(() => useRequestList());
        expect(result.current.isFiltered).toBe(false);
    });

    it('isFiltered is true when status filter is active', () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setFilter('status', 'PENDING');
        });
        expect(result.current.isFiltered).toBe(true);
    });

    it('isFiltered is true when search is active (after debounce)', async () => {
        const { result } = renderHook(() => useRequestList());
        act(() => {
            result.current.setSearchQuery('alpha');
        });
        await waitFor(() => {
            expect(result.current.isFiltered).toBe(true);
        }, { timeout: 1000 });
    });
});
