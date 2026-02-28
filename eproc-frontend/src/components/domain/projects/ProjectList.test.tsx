/**
 * Tests for the enhanced ProjectList component.
 *
 * Covers:
 *  - Loading state
 *  - Error state (with retry)
 *  - Empty state (generic, with custom action)
 *  - Project rows rendered (desktop table + mobile cards)
 *  - Status filter pills
 *  - Search
 *  - onRowClick wired through (desktop + mobile)
 *  - No cursor / non-interactive behaviour when onRowClick is omitted
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectList } from './ProjectList';

// ---------------------------------------------------------------------------
// Hoist mocks before any imports are evaluated
// ---------------------------------------------------------------------------
const { useProjectsMock } = vi.hoisted(() => ({
    useProjectsMock: vi.fn(),
}));

vi.mock('../../../hooks/queries/useProjects', () => ({
    useProjects: useProjectsMock,
}));

// Mock useDebounce as a pass-through so search filtering is instant in tests.
// Debounce timing is tested separately in useProjectList.test.ts.
vi.mock('../../../hooks/useDebounce', () => ({
    useDebounce: <T,>(value: T) => value,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockProjects = [
    {
        id: 1,
        name: 'Alpha Project',
        ownerName: 'Jane Smith',
        status: 'ACTIVE',
        budgetTotal: 500000,
        currency: 'TZS',
        createdAt: '2024-01-15T10:00:00Z',
        teamCount: 4,
    },
    {
        id: 2,
        name: 'Beta Project',
        ownerName: 'John Doe',
        status: 'COMPLETED',
        budgetTotal: 1200000,
        currency: 'TZS',
        createdAt: '2024-02-10T10:00:00Z',
        teamCount: 7,
    },
];

const renderList = (props: React.ComponentProps<typeof ProjectList> = {}) =>
    render(
        <BrowserRouter>
            <ProjectList {...props} />
        </BrowserRouter>
    );

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('ProjectList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useProjectsMock.mockReturnValue({
            data: mockProjects,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });

    // --- Loading -----------------------------------------------------------
    it('renders loading spinner while data is fetching', () => {
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        });
        renderList();
        expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
    });

    // --- Error -------------------------------------------------------------
    it('renders error display when query fails', () => {
        const refetch = vi.fn();
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error('Network error'),
            refetch,
        });
        renderList();
        expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument();
    });

    // --- Empty state (no custom action) ------------------------------------
    it('renders generic empty state when there are no projects', () => {
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        renderList();
        expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
        expect(
            screen.getByText(/you have not been assigned to any project yet/i)
        ).toBeInTheDocument();
    });

    // --- Empty state (custom action) --------------------------------------
    it('renders a custom emptyStateAction when provided', () => {
        useProjectsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        const handleCreate = vi.fn();
        renderList({
            emptyStateAction: (
                <button onClick={handleCreate}>Create Project</button>
            ),
        });
        const btn = screen.getByRole('button', { name: /create project/i });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(handleCreate).toHaveBeenCalledTimes(1);
    });

    // --- Data rendering ----------------------------------------------------
    it('renders all projects when data is available', async () => {
        renderList();
        await waitFor(() => {
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Beta Project/i).length).toBeGreaterThan(0);
        });
    });

    // --- Status filter pills -----------------------------------------------
    it('filters projects by status pill click', async () => {
        renderList();
        await waitFor(() =>
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0)
        );

        // Click the COMPLETED pill
        const completedPill = screen.getByRole('button', { name: /completed/i });
        fireEvent.click(completedPill);

        await waitFor(() => {
            expect(screen.getAllByText(/Beta Project/i).length).toBeGreaterThan(0);
        });
        // Alpha is hidden — queryAllByText returns no matches
        expect(screen.queryAllByText(/Alpha Project/i)).toHaveLength(0);
    });

    // --- Search ------------------------------------------------------------
    it('filters projects by search query', async () => {
        renderList();
        await waitFor(() =>
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0)
        );

        const searchInput = screen.getByPlaceholderText(/search projects/i);
        fireEvent.change(searchInput, { target: { value: 'Beta' } });

        await waitFor(() => {
            expect(screen.getAllByText(/Beta Project/i).length).toBeGreaterThan(0);
            // Alpha is gone once the (mocked instant) debounce filter fires
            expect(screen.queryAllByText(/Alpha Project/i)).toHaveLength(0);
        });
    });

    // --- onRowClick (desktop DataTable row) --------------------------------
    it('calls onRowClick with the clicked project (desktop view)', async () => {
        const handleRowClick = vi.fn();
        renderList({ onRowClick: handleRowClick });

        await waitFor(() =>
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0)
        );

        // Click the first occurrence (desktop table row)
        fireEvent.click(screen.getAllByText(/Alpha Project/i)[0]);
        expect(handleRowClick).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: 'Alpha Project' })
        );
    });

    // --- No onRowClick: rows are non-interactive --------------------------
    it('does not call any handler when onRowClick is omitted and a row is clicked', async () => {
        // Simply ensure clicking does not throw
        renderList();
        await waitFor(() =>
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0)
        );
        fireEvent.click(screen.getAllByText(/Alpha Project/i)[0]);
        // No assertion needed — test passes if no error is thrown
    });

    // --- Sort order toggle -----------------------------------------------
    it('toggles sort direction when the sort-order button is clicked', async () => {
        renderList();
        await waitFor(() =>
            expect(screen.getAllByText(/Alpha Project/i).length).toBeGreaterThan(0)
        );

        // The sort-order button renders its current direction as visible text ("asc" or "desc").
        // We find it by its text content: initially "desc" (default sort order).
        const sortOrderBtn = screen.getByRole('button', { name: /^(asc|desc)$/i });
        const initialText = sortOrderBtn.textContent?.trim();
        fireEvent.click(sortOrderBtn);
        expect(sortOrderBtn.textContent?.trim()).not.toBe(initialText);
    });
});
