/**
 * ErrorDisplay Component
 * 
 * Reusable component for query/fetch error states.
 * Fills the "component-level" gap in the 3-tier error architecture:
 *   1. Global (axios interceptor) → toast for network/500
 *   2. Hook-level (useErrorHandler) → toast for 400-level mutations
 *   3. Component-level (ErrorDisplay) → in-page UI for query errors
 * 
 * Two variants:
 *   - "page": Full centered display (replaces page content on error)
 *   - "inline": Compact alert banner (for section-level errors)
 */

import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
    /** The error object from React Query or a catch block */
    error: Error | null;
    /** Title shown above the message (e.g. "Failed to load purchase orders") */
    title?: string;
    /** Override the auto-extracted error message */
    message?: string;
    /** Called when user clicks "Try Again" */
    onRetry?: () => void;
    /** Called when user clicks the back button */
    onBack?: () => void;
    /** Custom label for the back button */
    backLabel?: string;
    /** "page" = full centered layout, "inline" = compact alert bar */
    variant?: 'page' | 'inline';
    className?: string;
}

/**
 * Extract a user-friendly message from various error shapes.
 */
function extractMessage(error: Error | null): string {
    if (!error) return 'An unexpected error occurred.';

    // Axios error shape
    const axiosError = error as any;
    if (axiosError.response?.data) {
        const data = axiosError.response.data;
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.error) return data.error;
    }

    // Network error
    if (axiosError.code === 'ERR_NETWORK') {
        return 'Unable to connect to the server. Please check your connection.';
    }

    return error.message || 'An unexpected error occurred.';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    title = 'Something went wrong',
    message,
    onRetry,
    onBack,
    backLabel = 'Go Back',
    variant = 'page',
    className,
}) => {
    const displayMessage = message || extractMessage(error);

    if (variant === 'inline') {
        return (
            <div
                className={cn(
                    'rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3',
                    className
                )}
            >
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800">{title}</p>
                    <p className="text-sm text-red-600 mt-0.5">{displayMessage}</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors shrink-0"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // Page variant (default)
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4 text-center',
                className
            )}
        >
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">{displayMessage}</p>
            <div className="flex items-center gap-3">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                )}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </button>
                )}
            </div>
        </div>
    );
};
