import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker, type DatePreset, getPresetRange, PRESET_LABELS } from './DateRangePicker';

describe('DateRangePicker', () => {
    const mockSetDateRange = vi.fn();
    const mockSetDatePreset = vi.fn();
    const mockFormatDisplayDate = vi.fn((date) => date);

    const defaultProps = {
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
        setDateRange: mockSetDateRange,
        datePreset: 'CUSTOM' as DatePreset,
        setDatePreset: mockSetDatePreset,
        formatDisplayDate: mockFormatDisplayDate,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render date range button', () => {
        render(<DateRangePicker {...defaultProps} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display formatted date range for custom preset', () => {
        mockFormatDisplayDate.mockImplementation((date) => date.substring(0, 10));
        render(<DateRangePicker {...defaultProps} />);

        expect(mockFormatDisplayDate).toHaveBeenCalledWith('2024-01-01');
        expect(mockFormatDisplayDate).toHaveBeenCalledWith('2024-01-31');
    });

    it('should open picker on button click', () => {
        render(<DateRangePicker {...defaultProps} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Should show preset options
        expect(screen.getByText(PRESET_LABELS.TODAY)).toBeInTheDocument();
        expect(screen.getByText(PRESET_LABELS.YESTERDAY)).toBeInTheDocument();
        expect(screen.getByText(PRESET_LABELS.LAST_7)).toBeInTheDocument();
    });

    it('should apply preset selection immediately', () => {
        render(<DateRangePicker {...defaultProps} />);
        fireEvent.click(screen.getByRole('button'));

        // Select "Today" preset - should apply immediately
        const todayButton = screen.getByText(PRESET_LABELS.TODAY);
        fireEvent.click(todayButton);

        // Should have directly called setters
        expect(mockSetDatePreset).toHaveBeenCalledWith('TODAY');
        expect(mockSetDateRange).toHaveBeenCalled();
    });

    it('should show Apply/Cancel only in Custom mode', () => {
        render(<DateRangePicker {...defaultProps} datePreset="CUSTOM" />);
        fireEvent.click(screen.getByRole('button'));

        // Custom preset should be highlighted
        const customButton = screen.getByText(PRESET_LABELS.CUSTOM);
        expect(customButton.className).toContain('bg-[#2a3455]');

        // Apply and Cancel should be visible
        expect(screen.getByText('Apply')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
});

describe('getPresetRange', () => {
    it('should return correct range for TODAY', () => {
        const range = getPresetRange('TODAY');
        expect(range.start).toBe(range.end);
    });

    it('should return correct range for YESTERDAY', () => {
        const range = getPresetRange('YESTERDAY');
        const today = new Date().toISOString().split('T')[0];
        expect(range.start).not.toBe(today);
        expect(range.start).toBe(range.end);
    });

    it('should return 7-day range for LAST_7', () => {
        const range = getPresetRange('LAST_7');
        const start = new Date(range.start);
        const end = new Date(range.end);
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(6);
    });

    it('should return 30-day range for LAST_30', () => {
        const range = getPresetRange('LAST_30');
        const start = new Date(range.start);
        const end = new Date(range.end);
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(29);
    });

    it('should return valid month range for THIS_MONTH', () => {
        const range = getPresetRange('THIS_MONTH');
        expect(range.start).toBeTruthy();
        expect(range.end).toBeTruthy();
        expect(range.start.length).toBe(10); // YYYY-MM-DD format
        expect(range.end.length).toBe(10);
    });

    it('should return valid month range for LAST_MONTH', () => {
        const range = getPresetRange('LAST_MONTH');
        expect(range.start).toBeTruthy();
        expect(range.end).toBeTruthy();
        expect(range.start.length).toBe(10);
        expect(range.end.length).toBe(10);
    });

    it('should return empty range for ALL', () => {
        const range = getPresetRange('ALL');
        expect(range.start).toBe('');
        expect(range.end).toBe('');
    });

    it('should return empty range for CUSTOM', () => {
        const range = getPresetRange('CUSTOM');
        expect(range.start).toBe('');
        expect(range.end).toBe('');
    });
});

describe('PRESET_LABELS', () => {
    it('should have labels for all presets', () => {
        const presets: DatePreset[] = ['ALL', 'TODAY', 'YESTERDAY', 'LAST_7', 'LAST_30', 'THIS_MONTH', 'LAST_MONTH', 'CUSTOM'];
        presets.forEach(preset => {
            expect(PRESET_LABELS[preset]).toBeDefined();
            expect(typeof PRESET_LABELS[preset]).toBe('string');
        });
    });
});
