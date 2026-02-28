/**
 * Tests for useProjectList hook
 *
 * Covers:
 * - Loading / error state pass-through from useProjects
 * - Status filter: includes 'ALL' and each specific status
 * - Search filtering (debounced, matches name / owner / currency)
 * - Sort by date, name, budget in asc + desc order
 * - statusCounts computed correctly
 * - isFiltered flag
 * - setFilter updates state
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useProjectList } from './useProjectList';

// ---------------------------------------------------------------------------
// Hoist mocks
// ---------------------------------------------------------------------------
const { useProjectsMock } = vi.hoisted(() => ({
    useProjectsMock: vi.fn(),
}));

vi.mock('./queries/useProjects', () => ({
    useProjects: useProjectsMock,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockProjects = [
    {
        id: 1,
        name: 'Alpha Road',
        ownerName: 'Jane Smith',
        status: 'ACTIVE',
        budgetTotal: 500_000,
        currency: 'TZS',
        createdAt: '2024-01-01T00:00:00Z',
        teamCount: 3,
    },
    {
        id: 2,
        name: 'Beta Bridge',
        ownerName: 'John Doe',
        status: 'COMPLETED',
        budgetTotal: 1_200_000,
        currency: 'USD',
        createdAt: '2024-03-15T00:00:00Z',
        teamCount: 6,
    },
    {
        id: 3,
        name: 'Gamma Dam',
        ownerName: 'Alice Mwanga',
        status: 'CANCELLED',
        budgetTotal: 300_000,
        currency: 'TZS',
        createdAt: '2024-02-10T00:00:00Z',
        teamCount: 2,
    },
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('useProjectList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useProjectsMock.mockReturnValue({
            data: mockProjects,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });

    // --- Loading state -----------------------------------------------------
    it('returns isLoading:true while data is fetching', () => {
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useProjectList());
        expect(result.current.isLoading).toBe(true);
        expect(result.current.processedProjects).toHaveLength(0);
    });

    // --- Error state -------------------------------------------------------
    it('surfaces the error from useProjects', () => {
        const err = new Error('Network fail');
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: err,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useProjectList());
        expect(result.current.error).toBe(err);
    });

    // --- Default: all projects returned -----------------------------------
    it('returns all projects with no active filters', () => {
        const { result } = renderHook(() => useProjectList());
        expect(result.current.processedProjects).toHaveLength(3);
    });

    // --- Status filter ---------------------------------------------------
    it('filters to only ACTIVE projects when status is set', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('status', 'ACTIVE');
        });
        expect(result.current.processedProjects).toHaveLength(1);
        expect(result.current.processedProjects[0].name).toBe('Alpha Road');
    });

    it('returns empty list when no projects match the selected status', () => {
        useProjectsMock.mockReturnValue({
            data: mockProjects.filter((p) => p.status === 'ACTIVE'),
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('status', 'COMPLETED');
        });
        expect(result.current.processedProjects).toHaveLength(0);
    });

    // --- Search -----------------------------------------------------------
    it('filters by project name (debounced)', async () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setSearchQuery('beta');
        });
        // Wait for debounce (300 ms)
        await waitFor(() => {
            expect(result.current.processedProjects).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedProjects[0].name).toBe('Beta Bridge');
    });

    it('filters by owner name', async () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setSearchQuery('alice');
        });
        await waitFor(() => {
            expect(result.current.processedProjects).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedProjects[0].name).toBe('Gamma Dam');
    });

    it('filters by currency', async () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setSearchQuery('USD');
        });
        await waitFor(() => {
            expect(result.current.processedProjects).toHaveLength(1);
        }, { timeout: 1000 });
        expect(result.current.processedProjects[0].name).toBe('Beta Bridge');
    });

    // --- Sort -----------------------------------------------------------
    it('sorts by name ascending', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('sortField', 'name');
            result.current.setFilter('sortOrder', 'asc');
        });
        const names = result.current.processedProjects.map((p) => p.name);
        expect(names).toEqual(['Alpha Road', 'Beta Bridge', 'Gamma Dam']);
    });

    it('sorts by name descending', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('sortField', 'name');
            result.current.setFilter('sortOrder', 'desc');
        });
        const names = result.current.processedProjects.map((p) => p.name);
        expect(names).toEqual(['Gamma Dam', 'Beta Bridge', 'Alpha Road']);
    });

    it('sorts by budget ascending', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('sortField', 'budget');
            result.current.setFilter('sortOrder', 'asc');
        });
        const budgets = result.current.processedProjects.map((p) => p.budgetTotal);
        expect(budgets).toEqual([300_000, 500_000, 1_200_000]);
    });

    it('sorts by date descending (most recent first)', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('sortField', 'date');
            result.current.setFilter('sortOrder', 'desc');
        });
        const ids = result.current.processedProjects.map((p) => p.id);
        // Beta (2024-03-15) > Gamma (2024-02-10) > Alpha (2024-01-01)
        expect(ids).toEqual([2, 3, 1]);
    });

    // --- statusCounts ---------------------------------------------------
    it('computes correct statusCounts', () => {
        const { result } = renderHook(() => useProjectList());
        expect(result.current.statusCounts.ALL).toBe(3);
        expect(result.current.statusCounts.ACTIVE).toBe(1);
        expect(result.current.statusCounts.COMPLETED).toBe(1);
        expect(result.current.statusCounts.CANCELLED).toBe(1);
    });

    // --- isFiltered flag ------------------------------------------------
    it('isFiltered is false by default', () => {
        const { result } = renderHook(() => useProjectList());
        expect(result.current.isFiltered).toBe(false);
    });

    it('isFiltered is true when status filter is active', () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setFilter('status', 'ACTIVE');
        });
        expect(result.current.isFiltered).toBe(true);
    });

    it('isFiltered is true when search is active (after debounce)', async () => {
        const { result } = renderHook(() => useProjectList());
        act(() => {
            result.current.setSearchQuery('gamma');
        });
        await waitFor(() => {
            expect(result.current.isFiltered).toBe(true);
        }, { timeout: 1000 });
    });
});
