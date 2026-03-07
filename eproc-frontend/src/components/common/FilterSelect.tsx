import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectProps<T = any> {
    value: T;
    onChange: (val: T) => void;
    options: { value: T; label: string }[];
    label: string;
    icon?: React.ElementType;
    displayValueFn?: (val: T) => string;
    className?: string;
    minimal?: boolean;
}

/**
 * FilterSelect - Reusable dropdown filter component
 * 
 * @example
 * ```tsx
 * <FilterSelect
 *   value={selectedProject}
 *   onChange={setSelectedProject}
 *   options={projectOptions}
 *   label="Select Project"
 *   icon={Folder}
 * />
 * ```
 */
export function FilterSelect<T = any>({
    value,
    onChange,
    options,
    label,
    icon: Icon,
    displayValueFn,
    className,
    minimal = false
}: FilterSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedLabel = useMemo(() => {
        if (value === 'ALL') return label;
        if (displayValueFn) return displayValueFn(value);
        const opt = options.find(o => o.value === value);
        return opt ? opt.label : label;
    }, [value, options, label, displayValueFn]);

    return (
        <div className={cn("relative", !minimal && "min-w-[140px]", className)} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center justify-between text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2a3455] transition-colors",
                    minimal ? "p-2 h-8 w-8 justify-center" : "w-full px-3 h-9 text-left"
                )}
            >
                <div className={cn("flex items-center gap-2", !minimal && "truncate")}>
                    {Icon && <Icon className={cn("text-slate-400 flex-shrink-0", minimal ? "h-4 w-4" : "h-3.5 w-3.5")} />}
                    {!minimal && <span className="truncate text-slate-700">{selectedLabel}</span>}
                </div>
                {!minimal && <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-1" />}
            </button>

            {open && (
                <div className={cn(
                    "absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-y-auto",
                    minimal ? "right-0 w-48 max-h-[300px]" : "left-0 w-full min-w-[150px] max-h-[300px]"
                )}>
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors
                                    ${value === opt.value
                                        ? 'bg-[#2a3455] text-white font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
