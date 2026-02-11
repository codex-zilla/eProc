import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Hourglass,
    Truck,
    DollarSign,
    Filter,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PurchaseOrderResponse } from '../../services/procurementService';
import { getProjectPurchaseOrders } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/models';

// ── Date preset helpers ──────────────────────────────────────────────
type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

const PRESET_LABELS: Record<DatePreset, string> = {
    ALL: 'All Dates',
    TODAY: 'Today',
    YESTERDAY: 'Yesterday',
    LAST_7: 'Last 7 Days',
    LAST_30: 'Last 30 Days',
    THIS_MONTH: 'This Month',
    LAST_MONTH: 'Last Month',
    CUSTOM: 'Custom Range',
};

function getPresetRange(preset: DatePreset): { start: string; end: string } {
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

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function formatFooterDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Inline Calendar component ────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarGrid({
    year, month, startDate, endDate, onSelect,
}: {
    year: number; month: number;
    startDate: string; endDate: string;
    onSelect: (dateStr: string) => void;
}) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month).toLocaleString('en-US', { month: 'short', year: 'numeric' });

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

// ── FilterSelect component ───────────────────────────────────────────
function FilterSelect({
    value,
    onChange,
    options,
    label,
    icon: Icon,
    displayValueFn
}: {
    value: any;
    onChange: (val: any) => void;
    options: { value: any; label: string }[];
    label: string;
    icon?: React.ElementType;
    displayValueFn?: (val: any) => string;
}) {
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

// ── DateRangePicker component ────────────────────────────────────────
function DateRangePicker({
    dateRange,
    setDateRange,
    datePreset,
    setDatePreset,
}: {
    dateRange: { start: string; end: string };
    setDateRange: (r: { start: string; end: string }) => void;
    datePreset: DatePreset;
    setDatePreset: (p: DatePreset) => void;
}) {
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
                ? `${formatShortDate(dateRange.start)} – ${formatShortDate(dateRange.end)}`
                : 'Custom Range';

    // Only show 'ALL' in labels if actually selected (rare case if default is LAST_30)
    // Filter out 'ALL' from the list
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
                                            ? `${formatFooterDate(tempStart)} – ${formatFooterDate(tempEnd)}`
                                            : tempStart
                                                ? `From ${formatFooterDate(tempStart)}`
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



// ══════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════
const PurchaseOrders = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getPresetRange('LAST_30'));
    const [datePreset, setDatePreset] = useState<DatePreset>('LAST_30');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const projectsData = await projectService.getAllProjects();
            setProjects(projectsData);

            const allPOs: PurchaseOrderResponse[] = [];
            for (const project of projectsData) {
                try {
                    const pos = await getProjectPurchaseOrders(project.id);
                    allPOs.push(...pos);
                } catch (error) {
                    console.error(`Failed to fetch POs for project ${project.id}:`, error);
                }
            }
            setPurchaseOrders(allPOs);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        let filtered = [...purchaseOrders];

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(po => po.status === statusFilter);
        }
        if (projectFilter !== 'ALL') {
            filtered = filtered.filter(po => po.projectId === projectFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(query) ||
                po.projectName.toLowerCase().includes(query) ||
                (po.siteName || '').toLowerCase().includes(query) ||
                po.createdByName.toLowerCase().includes(query)
            );
        }
        if (dateRange.start) {
            filtered = filtered.filter(po => new Date(po.createdAt) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            const endOfDay = new Date(dateRange.end);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter(po => new Date(po.createdAt) <= endOfDay);
        }

        return filtered;
    }, [purchaseOrders, statusFilter, projectFilter, searchQuery, dateRange]);

    // Status card stats
    const stats = useMemo(() => {
        const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);
        const openCount = purchaseOrders.filter(po => po.status === 'OPEN').length;
        const closedCount = purchaseOrders.filter(po => po.status === 'CLOSED').length;
        const openValue = purchaseOrders.filter(po => po.status === 'OPEN').reduce((sum, po) => sum + po.totalValue, 0);
        return { total: purchaseOrders.length, totalValue, open: openCount, closed: closedCount, openValue };
    }, [purchaseOrders]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    const formatCompactCurrency = (amount: number) => {
        if (amount >= 1_000_000_000) return `TZS ${(amount / 1_000_000_000).toFixed(1)}B`;
        if (amount >= 1_000_000) return `TZS ${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `TZS ${(amount / 1_000).toFixed(1)}K`;
        return `TZS ${amount}`;
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' });

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                    <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading purchase orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-5 animate-in fade-in duration-500">
            {/* Status Summary Cards */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:pb-0 -mx-4 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                {[
                    { label: 'Total Active POs', value: stats.total, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', labelColor: 'text-[#2a3455]', valueColor: 'text-[#2a3455]' },
                    { label: 'Pending Approval', value: stats.open, icon: Hourglass, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', labelColor: 'text-amber-600', valueColor: 'text-amber-900' },
                    { label: 'Delivered This Month', value: stats.closed, icon: Truck, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', labelColor: 'text-green-600', valueColor: 'text-green-900' },
                    { label: 'Total Spend (YTD)', value: formatCompactCurrency(stats.totalValue), icon: DollarSign, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', labelColor: 'text-slate-600', valueColor: 'text-slate-900' },
                ].map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-xl border ${stat.borderColor} p-2 sm:p-3 shadow-sm flex justify-between relative overflow-hidden min-w-[140px] sm:min-w-0`}>
                        <div className="relative z-10">
                            <p className={`text-[10px] sm:text-xs font-medium ${stat.labelColor} uppercase tracking-wider`}>{stat.label}</p>
                            <h3 className={`text-lg sm:text-2xl font-bold ${stat.valueColor} mt-1 sm:mt-2`}>{stat.value}</h3>
                        </div>
                        <div className={`absolute -right-2 -bottom-1.5 p-2 opacity-10 sm:self-start sm:opacity-100 sm:relative sm:right-auto sm:bottom-auto sm:self-end sm:p-2 sm:rounded-lg sm:bg-white sm:bg-opacity-60 transition-all`}>
                            <stat.icon className={`h-9 w-9 sm:h-5 sm:w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">

                    <div className="flex items-center gap-2 w-full lg:w-auto flex-grow lg:flex-1">
                        {/* Search - Grow to fill space */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search PO #, Project..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 h-10 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                        </div>

                        {/* Mobile Filter Toggle - Inline with search */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex-none h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Desktop Filters / Mobile Collapsible */}
                    <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto`}>
                        {/* Project */}
                        <div className="min-w-[200px]">
                            <FilterSelect
                                label="All Projects"
                                value={projectFilter}
                                onChange={(val) => setProjectFilter(val)}
                                options={[
                                    { value: 'ALL', label: 'All Projects' },
                                    ...projects.map(p => ({ value: p.id, label: p.name }))
                                ]}
                            />
                        </div>

                        {/* Status */}
                        <div className="min-w-[140px]">
                            <FilterSelect
                                label="All Statuses"
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                options={[
                                    { value: 'ALL', label: 'All Statuses' },
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'CLOSED', label: 'Closed' }
                                ]}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <div className="min-w-[240px]">
                            <DateRangePicker
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                datePreset={datePreset}
                                setDatePreset={setDatePreset}
                            />
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary (Chips) */}
                {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || datePreset !== 'ALL') && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Active Filters:</span>

                        {statusFilter !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                <span>Status: {statusFilter === 'OPEN' ? 'Open' : 'Closed'}</span>
                                <button onClick={() => setStatusFilter('ALL')} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {projectFilter !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                                <span>Project: {projects.find(p => p.id === projectFilter)?.name}</span>
                                <button onClick={() => setProjectFilter('ALL')} className="hover:text-indigo-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {datePreset !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                <span>Date: {PRESET_LABELS[datePreset] || 'Custom'}</span>
                                <button onClick={() => { setDatePreset('ALL'); setDateRange({ start: '', end: '' }); }} className="hover:text-slate-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setStatusFilter('ALL');
                                setProjectFilter('ALL');
                                setSearchQuery('');
                                setDateRange({ start: '', end: '' });
                                setDatePreset('ALL');
                            }}
                            className="text-xs text-slate-500 hover:text-red-600 font-medium ml-1 underline decoration-dotted hover:decoration-solid underline-offset-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {filteredOrders.length === 0 ? (
                <Card className="border-slate-200 shadow-sm border-dashed">
                    <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No purchase orders found</h3>
                        {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || searchQuery) && (
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                Try adjusting your filters to find what you're looking for.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table */}
                    <Card className="border-slate-200 shadow-none hidden md:block overflow-hidden rounded-lg border">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#2a3455]">
                                    <TableRow className="hover:bg-[#2a3455] border-b-0">
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">PO Number</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Project</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Created Date</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Total Value (TZS)</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(po => (
                                        <TableRow
                                            key={po.id}
                                            onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                            className="hover:bg-indigo-50/50 cursor-pointer transition-colors group border-slate-100"
                                        >
                                            <TableCell className="p-2 pr-0">
                                                <span className="font-semibold text-[#2a3455] text-xs lg:text-sm">{po.poNumber}</span>
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-700">
                                                {po.projectName}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-600">
                                                {formatDate(po.createdAt)}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm font-bold text-slate-900 font-mono">
                                                {po.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0">
                                                <span className={`${getStatusBadgeClass(po.status)} text-[10px] lg:text-xs px-2 py-0.5 border rounded-full font-medium`}>
                                                    {po.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {filteredOrders.map(po => (
                            <Card
                                key={po.id}
                                className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                                onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-sm text-[#2a3455] line-clamp-1">{po.poNumber}</h3>
                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{po.projectName}</p>
                                        </div>
                                        <span className={`${getStatusBadgeClass(po.status)} text-[10px] px-2 py-0.5 whitespace-nowrap flex-shrink-0 border rounded-full font-medium`}>
                                            {po.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(po.createdAt)}
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 font-mono">{formatCurrency(po.totalValue)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrders;
