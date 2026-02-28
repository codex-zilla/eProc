import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { SearchInput } from '@/components/common/SearchInput';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SortOption {
    /** The value passed to setFilter / onSortFieldChange. */
    value: string;
    /** Human-readable label shown in the dropdown. */
    label: string;
}

export interface SearchSortToolbarProps {
    /** Current search input value. */
    searchQuery: string;
    /** Called on every keystroke — pass your hook's `setSearchQuery`. */
    onSearchChange: (value: string) => void;
    /** Placeholder text for the search input. */
    searchPlaceholder?: string;
    /** Current active sort-field value. */
    sortField: string;
    /** Called when the user picks a different sort field. */
    onSortFieldChange: (value: string) => void;
    /** Sort direction options — controls the toggle button direction. */
    sortOrder: 'asc' | 'desc';
    /** Called when the user clicks the sort-order toggle button. */
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    /** List of sort field options to show in the dropdown. */
    sortOptions: SortOption[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `SearchSortToolbar` — generic search + sort toolbar shared by list views.
 *
 * Renders:
 * - Full-width `SearchInput`
 * - Sort-field `<Select>` dropdown (options supplied as props)
 * - Sort-order toggle button (asc ↑ / desc ↓)
 *
 * Used by: `ProjectList`, `RequestList` (and future list pages).
 */
export function SearchSortToolbar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    sortField,
    onSortFieldChange,
    sortOrder,
    onSortOrderChange,
    sortOptions,
}: SearchSortToolbarProps) {
    const activeLabel =
        sortOptions.find((o) => o.value === sortField)?.label ?? sortField;

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
                <SearchInput
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full"
                />
            </div>
            <div className="flex items-center gap-2">
                <Select value={sortField} onValueChange={onSortFieldChange}>
                    <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 focus:border-indigo-500">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Sort by</span>
                            <span className="font-medium">{activeLabel}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 px-3 border-slate-200 bg-white hover:bg-slate-50 gap-1 flex items-center focus:bg-indigo-50"
                                onClick={() =>
                                    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
                                }
                            >
                                <span className="text-sm font-medium text-slate-600">
                                    {sortOrder}
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform text-slate-500 pt-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
