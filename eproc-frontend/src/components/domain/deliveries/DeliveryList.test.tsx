import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryList } from './DeliveryList';
import { useProjects } from '@/hooks/queries/useProjects';
import { usePurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import { BrowserRouter, useSearchParams } from 'react-router-dom';

// Mock hooks
vi.mock('@/hooks/queries/useProjects');
vi.mock('@/hooks/queries/usePurchaseOrders');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: vi.fn(),
        useNavigate: () => vi.fn(),
    };
});

// Mock data
const mockProjects = [
    { id: 1, name: 'Project A', status: 'ACTIVE' },
    { id: 2, name: 'Project B', status: 'ACTIVE' },
];

const mockPOs = [
    {
        id: 101,
        poNumber: 'PO-001',
        status: 'OPEN',
        totalValue: 5000,
        createdAt: '2023-01-01T00:00:00Z',
        items: [
            { id: 1, orderedQty: 10, totalDelivered: 5, materialDisplayName: 'Cement' }, // Partial
        ],
    },
    {
        id: 102,
        poNumber: 'PO-002',
        status: 'CLOSED',
        totalValue: 2000,
        createdAt: '2023-01-02T00:00:00Z',
        items: [
            { id: 2, orderedQty: 5, totalDelivered: 5, materialDisplayName: 'Steel' }, // Full
        ],
    },
];

describe('DeliveryList', () => {
    const mockSetSearchParams = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useSearchParams as any).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
    });

    it('renders project selection when no project is selected and multiple projects exist', () => {
        (useProjects as any).mockReturnValue({ data: mockProjects, isLoading: false });
        (usePurchaseOrders as any).mockReturnValue({ data: [], isLoading: false });

        render(
            <BrowserRouter>
                <DeliveryList role="ENGINEER" />
            </BrowserRouter>
        );

        expect(screen.getByText('Delivery Verification')).toBeInTheDocument();
        expect(screen.getByText('Select a project to view delivery status.')).toBeInTheDocument();
        expect(screen.getByText('Project A')).toBeInTheDocument();
        expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    it('renders purchase orders when project is selected', () => {
        const projectId = '1';
        (useSearchParams as any).mockReturnValue([new URLSearchParams({ projectId }), mockSetSearchParams]);
        (useProjects as any).mockReturnValue({ data: mockProjects, isLoading: false });
        (usePurchaseOrders as any).mockReturnValue({ data: mockPOs, isLoading: false });

        render(
            <BrowserRouter>
                <DeliveryList role="ENGINEER" />
            </BrowserRouter>
        );

        // Check Header
        expect(screen.getAllByText('Delivery Verification')[0]).toBeInTheDocument();
        expect(screen.getByText('Project A')).toBeInTheDocument();

        // Check Stats
        expect(screen.getByText('Total POs')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 POs

        const fullyDeliveredTexts = screen.getAllByText('Fully Delivered');
        expect(fullyDeliveredTexts.length).toBeGreaterThanOrEqual(1); // Stats + PO Status
        const fullyDeliveredCount = screen.getAllByText('1');
        expect(fullyDeliveredCount.length).toBeGreaterThanOrEqual(1); // Stats counts

        const partialTexts = screen.getAllByText('Partial');
        expect(partialTexts.length).toBeGreaterThanOrEqual(1);

        // Check PO List
        expect(screen.getByText('PO-001')).toBeInTheDocument();
        expect(screen.getByText('PO-002')).toBeInTheDocument();
        expect(screen.getByText('Cement')).toBeInTheDocument();
    });

    it('calculates stats correctly', () => {
        const projectId = '1';
        (useSearchParams as any).mockReturnValue([new URLSearchParams({ projectId }), mockSetSearchParams]);
        (useProjects as any).mockReturnValue({ data: mockProjects, isLoading: false });
        (usePurchaseOrders as any).mockReturnValue({ data: mockPOs, isLoading: false });

        render(
            <BrowserRouter>
                <DeliveryList role="ENGINEER" />
            </BrowserRouter>
        );

        // 50% delivered
        expect(screen.getByText('50% Delivered')).toBeInTheDocument();
        // Fully delivered
        const fullyDeliveredTexts = screen.getAllByText('Fully Delivered');
        expect(fullyDeliveredTexts.length).toBeGreaterThan(0);
    });

    it('shows loading spinner', () => {
        (useProjects as any).mockReturnValue({ data: [], isLoading: true });
        (usePurchaseOrders as any).mockReturnValue({ data: [], isLoading: false });

        render(
            <BrowserRouter>
                <DeliveryList role="ENGINEER" />
            </BrowserRouter>
        );

        expect(screen.getByText('Loading delivery data...')).toBeInTheDocument();
    });

    it('handles error state', () => {
        (useProjects as any).mockReturnValue({ data: [], isLoading: false, error: { message: 'Failed to load' } });
        (usePurchaseOrders as any).mockReturnValue({ data: [], isLoading: false });

        render(
            <BrowserRouter>
                <DeliveryList role="ENGINEER" />
            </BrowserRouter>
        );

        expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
});
