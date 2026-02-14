import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterSelectProps<T = any> {
    value: T;
    onChange: (val: T) => void;
    options: { value: T; label: string }[];
    label: string;
    icon?: React.ElementType;
    displayValueFn?: (val: T) => string;
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
    displayValueFn
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
        <div className="relative min-w-[140px]" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 h-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-left"
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
                    <span className="truncate text-slate-700">{selectedLabel}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 w-full min-w-[180px] max-h-[300px] overflow-y-auto">
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
