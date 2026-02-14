import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSelect } from './FilterSelect';

describe('FilterSelect', () => {
    const mockOnChange = vi.fn();
    const defaultProps = {
        value: 'ALL',
        onChange: mockOnChange,
        options: [
            { value: 'ALL', label: 'All Items' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
        ],
        label: 'Filter',
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render with default label when value is ALL', () => {
        render(<FilterSelect {...defaultProps} />);
        expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('should display selected option label', () => {
        render(<FilterSelect {...defaultProps} value="ACTIVE" />);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should open dropdown on button click', () => {
        render(<FilterSelect {...defaultProps} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // All options should be visible
        expect(screen.getByText('All Items')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should call onChange when option is selected', () => {
        render(<FilterSelect {...defaultProps} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        const activeOption = screen.getByText('Active');
        fireEvent.click(activeOption);

        expect(mockOnChange).toHaveBeenCalledWith('ACTIVE');
    });

    it('should use custom displayValueFn when provided', () => {
        const displayValueFn = (val: string) => `Custom: ${val}`;
        render(<FilterSelect {...defaultProps} value="ACTIVE" displayValueFn={displayValueFn} />);

        expect(screen.getByText('Custom: ACTIVE')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
        render(
            <div>
                <FilterSelect {...defaultProps} />
                <div data-testid="outside">Outside</div>
            </div>
        );

        // Open dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(screen.getByText('All Items')).toBeInTheDocument();

        // Click outside
        const outside = screen.getByTestId('outside');
        fireEvent.mouseDown(outside);

        // Dropdown should close (options not visible)
        await vi.waitFor(() => {
            expect(screen.queryByText('All Items')).not.toBeInTheDocument();
        }, { timeout: 100 });
    });

    it('should render with icon when provided', () => {
        const MockIcon = () => <span data-testid="mock-icon">Icon</span>;
        render(<FilterSelect {...defaultProps} icon={MockIcon} />);

        expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should work with generic types', () => {
        type StatusFilter = 'ALL' | 'OPEN' | 'CLOSED';
        const typedProps = {
            value: 'ALL' as StatusFilter,
            onChange: (val: StatusFilter) => mockOnChange(val),
            options: [
                { value: 'ALL' as StatusFilter, label: 'All' },
                { value: 'OPEN' as StatusFilter, label: 'Open' },
                { value: 'CLOSED' as StatusFilter, label: 'Closed' },
            ],
            label: 'Status',
        };

        render(<FilterSelect<StatusFilter> {...typedProps} />);
        expect(screen.getByText('Status')).toBeInTheDocument();
    });
});
