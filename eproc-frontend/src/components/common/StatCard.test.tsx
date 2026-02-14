/**
 * Tests for StatCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { FileText } from 'lucide-react';

describe('StatCard', () => {
    it('should render label and value', () => {
        render(
            <StatCard
                label="Total Requests"
                value={42}
                icon={FileText}
                color="blue"
            />
        );

        expect(screen.getByText('Total Requests')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render string values', () => {
        render(
            <StatCard
                label="Status"
                value="Active"
                icon={FileText}
                color="green"
            />
        );

        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render trend indicator when provided', () => {
        render(
            <StatCard
                label="Growth"
                value={100}
                icon={FileText}
                color="green"
                trend={{ value: 12.5, isPositive: true }}
            />
        );

        expect(screen.getByText('↑ 12.5%')).toBeInTheDocument();
    });

    it('should show negative trend', () => {
        render(
            <StatCard
                label="Decline"
                value={50}
                icon={FileText}
                color="red"
                trend={{ value: -8, isPositive: false }}
            />
        );

        expect(screen.getByText('↓ 8%')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(
            <StatCard
                label="Test"
                value={10}
                icon={FileText}
                color="blue"
                className="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
});
