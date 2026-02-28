/**
 * Tests for manager/Projects.tsx
 *
 * Covers:
 *  - PageHeader renders with correct title, description, and "Create New Project" button
 *  - "Create New Project" link points to the correct route
 *  - ProjectList is rendered (smoke test via a visible element it always renders)
 *  - Row click navigates to the project detail route
 *  - Empty-state "Create Project" link is wired to the correct route
 *  - Custom manager columns are passed to ProjectList (no Owner, includes Team)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ManagerProjects from './Projects';

// ---------------------------------------------------------------------------
// Hoist mocks
// ---------------------------------------------------------------------------
const { useProjectsMock, navigateMock } = vi.hoisted(() => ({
    useProjectsMock: vi.fn(),
    navigateMock: vi.fn(),
}));

vi.mock('../../hooks/queries/useProjects', () => ({
    useProjects: useProjectsMock,
}));

// We need to mock the domain ProjectList to keep tests focused on the page
// itself (navigation, header) and avoid re-testing ProjectList internals.
// The mock surfaces the onRowClick, emptyStateAction, and columns props.
let capturedColumns: unknown[] | undefined;
vi.mock('../../components/domain/projects/ProjectList', () => ({
    ProjectList: ({
        onRowClick,
        emptyStateAction,
        columns,
    }: {
        onRowClick?: (p: { id: number; name: string }) => void;
        emptyStateAction?: React.ReactNode;
        columns?: unknown[];
    }) => {
        capturedColumns = columns;
        return (
            <div>
                <span data-testid="project-list">ProjectList</span>
                <button
                    data-testid="row-click-trigger"
                    onClick={() => onRowClick?.({ id: 99, name: 'Test Project' })}
                >
                    Click Row
                </button>
                <div data-testid="empty-state-action">{emptyStateAction}</div>
            </div>
        );
    },
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockProjects = [
    {
        id: 1,
        name: 'Test Project',
        status: 'ACTIVE',
        budgetTotal: 100000,
        currency: 'TZS',
        createdAt: '2024-01-01T00:00:00Z',
    },
];

const renderPage = () =>
    render(
        <BrowserRouter>
            <ManagerProjects />
        </BrowserRouter>
    );

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
describe('ManagerProjects', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useProjectsMock.mockReturnValue({
            data: mockProjects,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });

    // --- Page header -------------------------------------------------------
    it('renders the page header with correct title', () => {
        renderPage();
        expect(screen.getByText(/my projects/i)).toBeInTheDocument();
    });

    it('renders the page header description', () => {
        renderPage();
        expect(
            screen.getByText(/manage and monitor all projects/i)
        ).toBeInTheDocument();
    });

    it('renders a "Create New Project" link pointing to /manager/projects/new', () => {
        renderPage();
        const link = screen.getByRole('link', { name: /create new project/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/manager/projects/new');
    });

    // --- ProjectList slot ---------------------------------------------------
    it('renders the shared ProjectList component', () => {
        renderPage();
        expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });

    // --- Row navigation ----------------------------------------------------
    it('navigates to the project detail page when a row is clicked', async () => {
        renderPage();
        fireEvent.click(screen.getByTestId('row-click-trigger'));
        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/manager/projects/99');
        });
    });

    // --- Empty-state action ------------------------------------------------
    it('renders an empty-state "Create Project" link inside the empty-state slot', () => {
        renderPage();
        const slot = screen.getByTestId('empty-state-action');
        // The link rendered inside the empty state action slot
        const link = slot.querySelector('a');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/manager/projects/new');
    });
    // --- Custom columns ----------------------------------------------------
    it('passes custom manager columns to ProjectList (no Owner column, includes Team)', () => {
        capturedColumns = undefined;
        renderPage();
        expect(capturedColumns).toBeDefined();
        const headers = (capturedColumns as unknown as Array<{ header: string }>).map(
            (c) => c.header
        );
        expect(headers).not.toContain('Owner');
        expect(headers).toContain('Team');
        expect(headers).toContain('Project Name');
        expect(headers).toContain('Status');
    });
});
