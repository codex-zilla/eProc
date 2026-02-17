import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Calendar,
    Hourglass,
    Truck,
    DollarSign,
    Filter,
    X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '../../lib/formatters';
import {
    FilterSelect,
    DateRangePicker,
    type DatePreset,
    getPresetRange,
    PRESET_LABELS,
    EmptyState,
    ErrorDisplay,
    DataTable,
    type ColumnDef,
    LoadingSpinner,
} from '../../components/common';
import type { PurchaseOrder } from '@/types/models';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useProjects } from '@/hooks/queries/useProjects';
import { useAllPurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { computePOListStats } from '@/lib/po-stats';

interface POFilters {
    status: 'ALL' | 'OPEN' | 'CLOSED';
    project: number | 'ALL';
    search: string;
    dateRange: { start: string; end: string };
    datePreset: DatePreset;
}

const buildColumns = (): ColumnDef<PurchaseOrder>[] => [
    {
        id: 'poNumber',
        header: 'PO Number',
        cell: (po) => (
            <span className="font-semibold text-[#2a3455] text-xs lg:text-sm">{po.poNumber}</span>
        ),
        headerClassName: 'pr-0',
        className: 'pr-0',
    },
    {
        id: 'project',
        header: 'Project',
        accessorKey: 'projectName',
        headerClassName: 'pr-0',
        className: 'pr-0 text-slate-700',
    },
    {
        id: 'createdDate',
        header: 'Created Date',
        cell: (po) => formatDate(po.createdAt),
        headerClassName: 'pr-0',
        className: 'pr-0 text-slate-700',
    },
    {
        id: 'totalValue',
        header: 'Total Value (TZS)',
        cell: (po) => (
            <span className="font-bold text-slate-900 font-mono">{formatCurrency(po.totalValue)}</span>
        ),
        headerClassName: 'pr-0',
        className: 'pr-0',
    },
    {
        id: 'status',
        header: 'Status',
        cell: (po) => <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />,
        headerClassName: 'pr-0',
        className: 'pr-0',
    },
];

const PurchaseOrders = () => {
    const navigate = useNavigate();
    const {
        data: projects = [],
        isLoading: isLoadingProjects,
        error: projectsError,
        refetch: refetchProjects,
    } = useProjects();

    const {
        data: purchaseOrders = [],
        isLoading: isLoadingPOs,
        error: posError,
        refetch: refetchPOs,
    } = useAllPurchaseOrders();

    const loading = isLoadingProjects || isLoadingPOs;
    const error = projectsError || posError;

    const { filters, setFilter } = useFilters<POFilters>({
        status: 'ALL',
        project: 'ALL',
        search: '',
        dateRange: getPresetRange('LAST_30'),
        datePreset: 'LAST_30',
    });

    const debouncedSearch = useDebounce(filters.search, 300);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const stats = useMemo(() => computePOListStats(purchaseOrders), [purchaseOrders]);

    const filteredOrders = useMemo(() => {
        let filtered = [...purchaseOrders];

        if (filters.status !== 'ALL') {
            filtered = filtered.filter(po => po.status === filters.status);
        }
        if (filters.project !== 'ALL') {
            filtered = filtered.filter(po => po.projectId === filters.project);
        }
        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(query) ||
                po.projectName.toLowerCase().includes(query) ||
                (po.siteName || '').toLowerCase().includes(query) ||
                po.createdByName.toLowerCase().includes(query)
            );
        }
        if (filters.dateRange.start) {
            filtered = filtered.filter(po => new Date(po.createdAt) >= new Date(filters.dateRange.start));
        }
        if (filters.dateRange.end) {
            const endOfDay = new Date(filters.dateRange.end);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter(po => new Date(po.createdAt) <= endOfDay);
        }

        return filtered;
    }, [purchaseOrders, filters.status, filters.project, debouncedSearch, filters.dateRange]);

    const columns = useMemo(() => buildColumns(), []);

    const resetFilters = () => {
        setFilter('status', 'ALL');
        setFilter('project', 'ALL');
        setFilter('search', '');
        setFilter('dateRange', { start: '', end: '' });
        setFilter('datePreset', 'ALL');
    };

    const hasActiveFilters =
        filters.status !== 'ALL' || filters.project !== 'ALL' || filters.datePreset !== 'ALL';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading purchase orders..." />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error as Error}
                title="Failed to load purchase orders"
                onRetry={() => { refetchProjects(); refetchPOs(); }}
            />
        );
    }

    return (
        <div className="space-y-3 sm:space-y-5 min-w-0">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                {[
                    { label: 'Total Active POs', value: stats.total, icon: FileText, color: 'text-blue-600' as const, bgColor: 'bg-blue-50', borderColor: 'border-blue-100', labelColor: 'text-[#2a3455]', valueColor: 'text-[#2a3455]' },
                    { label: 'Pending Approval', value: stats.open, icon: Hourglass, color: 'text-amber-600' as const, bgColor: 'bg-amber-50', borderColor: 'border-amber-100', labelColor: 'text-amber-600', valueColor: 'text-amber-900' },
                    { label: 'Delivered This Month', value: stats.closed, icon: Truck, color: 'text-green-600' as const, bgColor: 'bg-green-50', borderColor: 'border-green-100', labelColor: 'text-green-600', valueColor: 'text-green-900' },
                    { label: 'Total Spend (YTD)', value: formatCurrency(stats.totalValue, true), icon: DollarSign, color: 'text-slate-600' as const, bgColor: 'bg-slate-50', borderColor: 'border-slate-200', labelColor: 'text-slate-600', valueColor: 'text-slate-900' },
                ].map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-xl border ${stat.borderColor} p-2 sm:p-3 shadow-sm flex justify-between relative overflow-hidden min-w-[140px] sm:min-w-0`}>
                        <div className="relative z-10 min-w-0">
                            <p className={`text-[10px] sm:text-xs font-medium ${stat.labelColor} uppercase tracking-wider`}>{stat.label}</p>
                            <h3 className={`text-lg sm:text-2xl font-bold ${stat.valueColor} mt-1 sm:mt-2 truncate`}>{stat.value}</h3>
                        </div>
                        <div className="absolute -right-2 -bottom-1.5 p-2 opacity-10 sm:self-start sm:opacity-100 sm:relative sm:right-auto sm:bottom-auto sm:self-end sm:p-2 sm:rounded-lg sm:bg-white sm:bg-opacity-60 transition-all shrink-0">
                            <stat.icon className={`h-9 w-9 sm:h-5 sm:w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="space-y-2">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">

                    <div className="flex items-center gap-2 w-full lg:w-auto flex-grow lg:flex-1 min-w-0">
                        {/* Search - Grow to fill space */}
                        <div className="relative flex-grow min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search PO, Project..."
                                value={filters.search}
                                onChange={(e) => setFilter('search', e.target.value)}
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
                        <div className="w-full lg:w-auto lg:min-w-[180px]">
                            <FilterSelect
                                label="All Projects"
                                value={filters.project}
                                onChange={(val) => setFilter('project', val)}
                                options={[
                                    { value: 'ALL', label: 'All Projects' },
                                    ...projects.map(p => ({ value: p.id, label: p.name }))
                                ]}
                            />
                        </div>

                        {/* Status */}
                        <div className="w-full lg:w-auto lg:min-w-[130px]">
                            <FilterSelect<'ALL' | 'OPEN' | 'CLOSED'>
                                label="All Statuses"
                                value={filters.status}
                                onChange={(val) => setFilter('status', val)}
                                options={[
                                    { value: 'ALL', label: 'All Statuses' },
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'CLOSED', label: 'Closed' }
                                ]}
                                icon={Hourglass}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <div className="w-full lg:w-auto lg:min-w-[220px]">
                            <DateRangePicker
                                dateRange={filters.dateRange}
                                setDateRange={(val) => setFilter('dateRange', val)}
                                datePreset={filters.datePreset}
                                setDatePreset={(val) => setFilter('datePreset', val)}
                                formatDisplayDate={(d) => formatDate(d, 'short')}
                            />
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary (Chips) */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 px-1 border-t border-slate-100">
                        {filters.status !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                <span>Status: {filters.status === 'OPEN' ? 'Open' : 'Closed'}</span>
                                <button onClick={() => setFilter('status', 'ALL')} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {filters.project !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                                <span>Project: {projects.find(p => p.id === filters.project)?.name}</span>
                                <button onClick={() => setFilter('project', 'ALL')} className="hover:text-indigo-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {filters.datePreset !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                <span>Date: {PRESET_LABELS[filters.datePreset] || 'Custom'}</span>
                                <button onClick={() => { setFilter('datePreset', 'ALL'); setFilter('dateRange', { start: '', end: '' }); }} className="hover:text-slate-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        <button
                            onClick={resetFilters}
                            className="text-xs text-slate-500 hover:text-red-600 font-medium ml-1 underline decoration-dotted hover:decoration-solid underline-offset-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No purchase orders found"
                    description={
                        (hasActiveFilters || filters.search)
                            ? "Try adjusting your filters to find what you're looking for."
                            : undefined
                    }
                />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <DataTable
                            data={filteredOrders}
                            columns={columns}
                            keyExtractor={(po) => po.id}
                            onRowClick={(po) => navigate(`/accountant/purchase-orders/${po.id}`)}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {filteredOrders.map(po => (
                            <Card
                                key={po.id}
                                className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                                onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-sm text-[#2a3455] line-clamp-1">{po.poNumber}</h3>
                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{po.projectName}</p>
                                        </div>
                                        <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />
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
