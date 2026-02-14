import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// ── Date preset types and helpers ──────────────────────────────────────────────

export type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

export const PRESET_LABELS: Record<DatePreset, string> = {
    ALL: 'All Dates',
    TODAY: 'Today',
    YESTERDAY: 'Yesterday',
    LAST_7: 'Last 7 Days',
    LAST_30: 'Last 30 Days',
    THIS_MONTH: 'This Month',
    LAST_MONTH: 'Last Month',
    CUSTOM: 'Custom Range',
};

export function getPresetRange(preset: DatePreset): { start: string; end: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    switch (preset) {
        case 'TODAY':
            return { start: fmt(today), end: fmt(today) };
        case 'YESTERDAY': {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            return { start: fmt(y), end: fmt(y) };
        }
        case 'LAST_7': {
            const d = new Date(today);
            d.setDate(d.getDate() - 6);
            return { start: fmt(d), end: fmt(today) };
        }
        case 'LAST_30': {
            const d = new Date(today);
            d.setDate(d.getDate() - 29);
            return { start: fmt(d), end: fmt(today) };
        }
        case 'THIS_MONTH': {
            const s = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: fmt(s), end: fmt(today) };
        }
        case 'LAST_MONTH': {
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const e = new Date(today.getFullYear(), today.getMonth(), 0);
            return { start: fmt(s), end: fmt(e) };
        }
        default:
            return { start: '', end: '' };
    }
}

// ── CalendarGrid helper component ──────────────────────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarGridProps {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
    onSelect: (dateStr: string) => void;
}

function CalendarGrid({ year, month, startDate, endDate, onSelect }: CalendarGridProps) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const cells: { day: number; current: boolean; dateStr: string }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevDays - i;
        const dt = new Date(year, month - 1, d);
        cells.push({ day: d, current: false, dateStr: dt.toISOString().split('T')[0] });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        cells.push({ day: d, current: true, dateStr: dt.toISOString().split('T')[0] });
    }
    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        const dt = new Date(year, month + 1, d);
        cells.push({ day: d, current: false, dateStr: dt.toISOString().split('T')[0] });
    }

    const isInRange = (dateStr: string) => {
        if (!startDate || !endDate) return false;
        return dateStr >= startDate && dateStr <= endDate;
    };
    const isStart = (dateStr: string) => dateStr === startDate;
    const isEnd = (dateStr: string) => dateStr === endDate;

    return (
        <div className="min-w-[200px] sm:min-w-[220px]">
            <p className="text-center text-xs font-semibold text-slate-800 mb-2">{monthName}</p>
            <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-medium mb-1">
                {DAYS.map(d => <span key={d} className="py-0.5">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs">
                {cells.map((c, i) => {
                    const inRange = isInRange(c.dateStr);
                    const start = isStart(c.dateStr);
                    const end = isEnd(c.dateStr);
                    const selected = start || end;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelect(c.dateStr)}
                            className={`
                                h-6 sm:h-7 w-full flex items-center justify-center transition-colors
                                ${!c.current ? 'text-slate-300' : 'text-slate-700'}
                                ${inRange && !selected ? 'bg-blue-50' : ''}
                                ${selected ? 'bg-[#2a3455] text-white rounded-md font-semibold' : ''}
                                ${!selected && c.current ? 'hover:bg-slate-100 rounded-md' : ''}
                            `}
                        >
                            {c.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── DateRangePicker component ──────────────────────────────────────────────────

interface DateRangePickerProps {
    dateRange: { start: string; end: string };
    setDateRange: (r: { start: string; end: string }) => void;
    datePreset: DatePreset;
    setDatePreset: (p: DatePreset) => void;
    formatDisplayDate: (dateStr: string) => string;
}

/**
 * DateRangePicker - Reusable date range picker with presets and dual calendar
 * 
 * Features:
 * - Preset date ranges (Today, Last 7 days, Last 30 days, etc.)
 * - Custom range selection with dual month calendar view
 * - Responsive mobile/desktop layouts
 * - Visual range highlighting
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   dateRange={dateRange}
 *   setDateRange={setDateRange}
 *   datePreset={datePreset}
 *   setDatePreset={setDatePreset}
 *   formatDisplayDate={formatDate}
 * />
 * ```
 */
export function DateRangePicker({
    dateRange,
    setDateRange,
    datePreset,
    setDatePreset,
    formatDisplayDate,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');

    // Two calendar months shown side-by-side
    const today = new Date();
    const [leftMonth, setLeftMonth] = useState(today.getMonth() === 0 ? 11 : today.getMonth() - 1);
    const [leftYear, setLeftYear] = useState(today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear());

    const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
    const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

    // Temp selection while picker is open
    const [tempStart, setTempStart] = useState(dateRange.start);
    const [tempEnd, setTempEnd] = useState(dateRange.end);
    const [tempPreset, setTempPreset] = useState<DatePreset>(datePreset);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync temp state when opened
    useEffect(() => {
        if (open) {
            setTempStart(dateRange.start);
            setTempEnd(dateRange.end);
            setTempPreset(datePreset);
            setSelecting('start');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handlePresetClick = (preset: DatePreset) => {
        if (preset === 'CUSTOM') {
            setTempPreset('CUSTOM');
            // Don't close, user needs to pick dates
        } else {
            const range = getPresetRange(preset);
            setDatePreset(preset);
            setDateRange(range);
            setOpen(false);
        }
    };

    const handleCalendarSelect = (dateStr: string) => {
        setTempPreset('CUSTOM');
        if (selecting === 'start') {
            setTempStart(dateStr);
            if (tempEnd && dateStr > tempEnd) setTempEnd('');
            setSelecting('end');
        } else {
            if (dateStr < tempStart) {
                setTempStart(dateStr);
                setSelecting('end');
            } else {
                setTempEnd(dateStr);
                setSelecting('start');
            }
        }
    };

    const handleApply = () => {
        setDatePreset(tempPreset);
        setDateRange({ start: tempStart, end: tempEnd });
        setOpen(false);
    };

    const handleCancel = () => setOpen(false);

    const navigateMonth = (dir: -1 | 1) => {
        let m = leftMonth + dir;
        let y = leftYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setLeftMonth(m);
        setLeftYear(y);
    };

    const displayLabel = datePreset === 'ALL'
        ? 'All Dates'
        : datePreset !== 'CUSTOM'
            ? PRESET_LABELS[datePreset]
            : dateRange.start && dateRange.end
                ? `${formatDisplayDate(dateRange.start)} – ${formatDisplayDate(dateRange.end)}`
                : 'Custom Range';

    // Filter out 'ALL' from the preset list
    const visiblePresets = (Object.keys(PRESET_LABELS) as DatePreset[]).filter(p => p !== 'ALL');

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 h-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-left"
            >
                <span className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{displayLabel}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-w-[90vw] sm:max-w-none">
                    <div className="flex flex-col sm:flex-row">
                        {/* Preset sidebar */}
                        <div className="flex flex-col overflow-x-auto sm:overflow-x-visible gap-1 p-2 sm:border-r border-b sm:border-b-0 border-slate-100 w-[150px] flex-shrink-0">
                            {visiblePresets.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`whitespace-nowrap px-1 py-1.5 text-xs font-medium rounded-md transition-colors text-left flex-shrink-0
                                        ${tempPreset === preset
                                            ? 'bg-[#2a3455] text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {PRESET_LABELS[preset]}
                                </button>
                            ))}
                        </div>

                        {/* Calendar area - ONLY show if Custom */}
                        {tempPreset === 'CUSTOM' && (
                            <div className="p-2 sm:p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <button type="button" onClick={() => navigateMonth(-1)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                                    </button>
                                    <span className="text-xs text-slate-400 font-medium">Select Range</span>
                                    <button type="button" onClick={() => navigateMonth(1)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                                        <ChevronRight className="h-4 w-4 text-slate-600" />
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    <CalendarGrid year={leftYear} month={leftMonth} startDate={tempStart} endDate={tempEnd} onSelect={handleCalendarSelect} />
                                    <CalendarGrid year={rightYear} month={rightMonth} startDate={tempStart} endDate={tempEnd} onSelect={handleCalendarSelect} />
                                </div>

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between mt-3 pt-2 border-t border-slate-100 gap-2">
                                    <p className="text-[10px] sm:text-xs text-slate-500">
                                        {tempStart && tempEnd
                                            ? `${formatDisplayDate(tempStart)} – ${formatDisplayDate(tempEnd)}`
                                            : tempStart
                                                ? `From ${formatDisplayDate(tempStart)}`
                                                : 'Pick a start date'}
                                    </p>
                                    <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                        <button type="button" onClick={handleCancel} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleApply} disabled={!tempStart || !tempEnd} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-white bg-[#2a3455] hover:bg-[#1e253e] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
