import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { ActiveFilters, type FilterChip } from './ActiveFilters';

export interface FilterToolbarProps {
    /** The primary search input component (usually <SearchInput />) */
    search: React.ReactNode;
    /** The filter UI elements (usually <FilterSelect />, <DateRangePicker />, etc.) */
    filters?: React.ReactNode;
    /** Array of active filter chips to display */
    activeFilters?: FilterChip[];
    /** Callback to clear all active filters */
    onClearAllFilters?: () => void;
}

export function FilterToolbar({
    search,
    filters,
    activeFilters = [],
    onClearAllFilters
}: FilterToolbarProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="flex items-center gap-2 w-full lg:w-auto flex-grow lg:flex-1 min-w-0">
                    <div className="flex-grow min-w-0">
                        {search}
                    </div>
                    {filters && (
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex-none h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {filters && (
                    <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto`}>
                        {filters}
                    </div>
                )}
            </div>

            {(activeFilters.length > 0) && (
                <ActiveFilters
                    chips={activeFilters}
                    onClearAll={onClearAllFilters || (() => { })}
                />
            )}
        </div>
    );
}
