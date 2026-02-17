
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterChip {
    id: string;
    label: string;
    onRemove: () => void;
    color?: 'blue' | 'indigo' | 'slate' | 'green' | 'amber' | 'red';
}

interface ActiveFiltersProps {
    chips: FilterChip[];
    onClearAll: () => void;
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:text-blue-900',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:text-indigo-900',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900',
    green: 'bg-green-50 text-green-700 border-green-100 hover:text-green-900',
    amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:text-amber-900',
    red: 'bg-red-50 text-red-700 border-red-100 hover:text-red-900',
} as const;

export function ActiveFilters({ chips, onClearAll, className }: ActiveFiltersProps) {
    if (chips.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap items-center gap-2 px-1 border-t border-slate-100 pt-2", className)}>
            {chips.map((chip) => (
                <div
                    key={chip.id}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                        colorClasses[chip.color || 'slate'].replace('hover:text-blue-900', '') // Base classes
                    )}
                >
                    <span>{chip.label}</span>
                    <button
                        onClick={chip.onRemove}
                        className={cn(
                            "hover:opacity-75 focus:outline-none",
                            // We can map specific hover text colors if needed, but opacity is often cleaner
                        )}
                        aria-label={`Remove ${chip.label} filter`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}

            {chips.length > 0 && (
                <button
                    onClick={onClearAll}
                    className="text-xs text-slate-500 hover:text-red-600 font-medium ml-1 underline decoration-dotted hover:decoration-solid underline-offset-2 transition-colors"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}
