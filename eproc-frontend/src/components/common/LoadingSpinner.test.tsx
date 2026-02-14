/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render with default size', () => {
        const { container } = render(<LoadingSpinner />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should render with custom text', () => {
        render(<LoadingSpinner text="Loading data..." />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should render in fullScreen mode', () => {
        const { container } = render(<LoadingSpinner fullScreen />);
        // Check for fullScreen wrapper class
        expect(container.querySelector('.fixed')).toBeInTheDocument();
    });

    it('should apply different sizes', () => {
        const { rerender, container } = render(<LoadingSpinner size="sm" />);
        let spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('h-4');

        rerender(<LoadingSpinner size="lg" />);
        spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('h-12');
    });

    it('should apply custom className', () => {
        const { container } = render(<LoadingSpinner className="my-spinner" />);
        expect(container.firstChild).toHaveClass('my-spinner');
    });
});
