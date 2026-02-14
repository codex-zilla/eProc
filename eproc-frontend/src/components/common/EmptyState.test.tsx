/**
 * Tests for EmptyState component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
    it('should render title and description', () => {
        render(
            <EmptyState
                icon={Inbox}
                title="No requests found"
                description="You haven't created any requests yet"
            />
        );

        expect(screen.getByText('No requests found')).toBeInTheDocument();
        expect(screen.getByText("You haven't created any requests yet")).toBeInTheDocument();
    });

    it('should render without description', () => {
        render(
            <EmptyState
                icon={Inbox}
                title="No data"
            />
        );

        expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should render action button when provided', () => {
        const handleClick = vi.fn();

        render(
            <EmptyState
                icon={Inbox}
                title="No items"
                action={{
                    label: 'Create New',
                    onClick: handleClick,
                }}
            />
        );

        const button = screen.getByText('Create New');
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply custom className', () => {
        const { container } = render(
            <EmptyState
                icon={Inbox}
                title="Test"
                className="my-custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('my-custom-class');
    });
});
