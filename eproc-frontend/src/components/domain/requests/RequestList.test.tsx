import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequestList } from './RequestList';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Hoist mocks
const { useRequestsMock, navigateMock } = vi.hoisted(() => {
    return {
        useRequestsMock: vi.fn(),
        navigateMock: vi.fn(),
    };
});

// Mock dependencies
vi.mock('../../../hooks/queries/useRequests', () => ({
    useRequests: useRequestsMock,
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

const mockRequests = [
    {
        id: 1,
        title: 'Fix leaks',
        siteName: 'Site A',
        createdByName: 'John Doe',
        createdAt: '2023-01-01T10:00:00Z',
        status: 'PENDING',
        projectName: 'Project Alpha',
        totalValue: 100000,
        priority: 'LOW',
    },
    {
        id: 2,
        title: 'Cement Request',
        siteName: 'Site B',
        createdByName: 'Jane Doe',
        createdAt: '2023-01-02T10:00:00Z',
        status: 'APPROVED',
        projectName: 'Project Beta',
        totalValue: 50000,
        priority: 'HIGH',
    },
];

describe('RequestList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useRequestsMock.mockReturnValue({
            data: mockRequests,
            isLoading: false,
            error: null,
        });
    });

    it('renders loading state', () => {
        useRequestsMock.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );
        expect(screen.getByText(/loading requests/i)).toBeInTheDocument();
    });

    it('renders error state', () => {
        useRequestsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error('Failed'),
        });
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );
        expect(screen.getByText(/failed to load requests/i)).toBeInTheDocument();
    });

    it('renders empty state', () => {
        useRequestsMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );
        expect(screen.getByText(/no requests found/i)).toBeInTheDocument();
    });

    it('renders requests grouped by project', async () => {
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );

        // Wait for headers
        expect(await screen.findByText(/Project Alpha/, {}, { timeout: 5000 })).toBeInTheDocument();
        expect(await screen.findByText(/Project Beta/, {}, { timeout: 5000 })).toBeInTheDocument();

        // Wait for items (using getAllByText because both desktop and mobile views are rendered)
        await waitFor(() => {
            const fixLeaks = screen.getAllByText(/Fix leaks/);
            expect(fixLeaks.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        await waitFor(() => {
            const cement = screen.getAllByText(/Cement/);
            expect(cement.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
    });

    it('filters requests by status', async () => {
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );

        // Click PENDING filter
        const pendingFilter = screen.getByRole('button', { name: /pending/i });
        fireEvent.click(pendingFilter);

        await waitFor(() => {
            const fixLeaks = screen.getAllByText(/Fix leaks/);
            expect(fixLeaks.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        expect(screen.queryByText(/Cement/)).not.toBeInTheDocument();
    });

    it('searches requests', async () => {
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );

        const searchInput = screen.getByPlaceholderText(/search/i);
        fireEvent.change(searchInput, { target: { value: 'Cement' } });

        expect(screen.queryByText(/Fix leaks/)).not.toBeInTheDocument();

        await waitFor(() => {
            const cement = screen.getAllByText(/Cement/);
            expect(cement.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
    });

    it('navigates to details on row click (Engineer)', async () => {
        render(
            <BrowserRouter>
                <RequestList role="ENGINEER" />
            </BrowserRouter>
        );

        await waitFor(() => {
            const elements = screen.getAllByText(/Fix leaks/);
            // Click the first one (doesn't matter which view)
            fireEvent.click(elements[0]);
        }, { timeout: 5000 });

        expect(navigateMock).toHaveBeenCalledWith('/engineer/requests/1');
    });

    it('navigates to details on row click (Manager)', async () => {
        render(
            <BrowserRouter>
                <RequestList role="MANAGER" />
            </BrowserRouter>
        );

        await waitFor(() => {
            const elements = screen.getAllByText(/Fix leaks/);
            fireEvent.click(elements[0]);
        }, { timeout: 5000 });

        expect(navigateMock).toHaveBeenCalledWith('/manager/requests/1');
    });
});
