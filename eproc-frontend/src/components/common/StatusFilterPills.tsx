export interface StatusPillItem {
    /** The raw status string (e.g. 'ALL', 'ACTIVE', 'PENDING'). */
    value: string;
    /** Human-readable label shown in the pill. Defaults to value if omitted. */
    label?: string;
    /** Number shown in the count badge. Badge is hidden when 0. */
    count: number;
}

interface StatusFilterPillsProps {
    /** Ordered list of pills to render. */
    items: StatusPillItem[];
    /** Currently active status value. */
    active: string;
    /** Called when the user clicks a pill. */
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Generic horizontal scrolling row of filter pills.
 *
 * Each pill shows a label and an optional count badge.
 * The active pill is highlighted with the brand dark colour.
 *
 * Usage:
 * ```tsx
 * <StatusFilterPills
 *   items={PROJECT_STATUS_VALUES.map(s => ({ value: s, label: getProjectStatusLabel(s), count: statusCounts[s] }))}
 *   active={filters.status}
 *   onChange={(v) => setFilter('status', v)}
 * />
 * ```
 */
export const StatusFilterPills = ({
    items,
    active,
    onChange,
    className = '',
}: StatusFilterPillsProps) => (
    <div className={`flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}>
        {items.map(({ value, label, count }) => {
            const isActive = active === value;
            return (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap ${isActive
                        ? 'bg-[#2a3455] text-white hover:bg-[#1e253e]'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                >
                    {label ?? value}
                    {count > 0 && (
                        <span
                            className={`flex items-center justify-center px-1.5 h-5 min-w-[1.25rem] rounded-full text-[10px] ${isActive
                                ? 'bg-white text-[#2a3455]'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {count}
                        </span>
                    )}
                </button>
            );
        })}
    </div>
);
