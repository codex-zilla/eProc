/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner for async operations
 * Provides consistent loading states across the application
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text,
    fullScreen = false,
    className,
}) => {
    const spinner = (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <Loader2 className={cn('animate-spin text-slate-600', sizeClasses[size])} />
            {text && <p className="text-sm text-gray-600">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
