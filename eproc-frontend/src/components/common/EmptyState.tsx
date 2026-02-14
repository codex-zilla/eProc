/**
 * EmptyState Component
 * 
 * Reusable empty state component for lists and tables
 * Replaces 20+ duplicate empty state implementations
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    } | React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 text-center',
                className
            )}
        >
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
            )}
            {action && (
                React.isValidElement(action) ? action : (
                    // @ts-ignore - we know it's the object shape if it's not a valid element
                    <button
                        onClick={(action as any).onClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        {(action as any).label}
                    </button>
                )
            )}
        </div>
    );
};
