import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    autoFocus?: boolean;
}

/**
 * SearchInput – Reusable search field with icon and clear button.
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search materials…"
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search…',
    className,
    inputClassName,
    autoFocus,
}) => {
    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn('pl-10 h-9', inputClassName)}
                autoFocus={autoFocus}
            />
            {value && (
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    onClick={() => onChange('')}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};
