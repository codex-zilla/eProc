/**
 * ReviewItem Component
 * 
 * Reusable summary display item for wizard review steps.
 * Shows a label/value pair in a consistent format.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ReviewItemProps {
    /** The label text (e.g. "Project Name", "Region") */
    label: string;
    /** The value to display */
    value: string | number | undefined | null;
    /** Fallback text when value is empty. Defaults to '-' */
    fallback?: string;
    /** Additional className for the wrapper */
    className?: string;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
    label,
    value,
    fallback = '-',
    className
}) => {
    const displayValue = value !== undefined && value !== null && value !== ''
        ? String(value)
        : fallback;

    return (
        <div className={cn('space-y-1', className)}>
            <span className="font-semibold text-gray-600">{label}:</span>
            <p className="text-gray-900">{displayValue}</p>
        </div>
    );
};
