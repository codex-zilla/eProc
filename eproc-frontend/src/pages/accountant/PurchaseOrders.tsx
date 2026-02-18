import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Hourglass,
    Truck,
    DollarSign,
    Filter,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../lib/formatters';
import {
    FilterSelect,
    DateRangePicker,
    getPresetRange,
    PRESET_LABELS,
    EmptyState,
    ErrorDisplay,
    DataTable,
    type ColumnDef,
    LoadingSpinner,
    StatCard,
    SearchInput,
    MobileListCard,
    ActiveFilters,
    type FilterChip
} from '../../components/common';
import type { PurchaseOrder } from '@/types/models';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useProjects } from '@/hooks/queries/useProjects';
import { useAllPurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { computePOListStats } from '@/lib/po-stats';
import { useFilteredPurchaseOrders, type POFilters } from '@/hooks/useFilteredPurchaseOrders';

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
    const filteredOrders = useFilteredPurchaseOrders(purchaseOrders, filters, debouncedSearch);

    const columns = useMemo(() => buildColumns(), []);

    const resetFilters = useCallback(() => {
        setFilter('status', 'ALL');
        setFilter('project', 'ALL');
        setFilter('search', '');
        setFilter('dateRange', { start: '', end: '' });
        setFilter('datePreset', 'ALL');
    }, [setFilter]);

    const activeFilterChips = useMemo<FilterChip[]>(() => {
        const chips: FilterChip[] = [];
        if (filters.status !== 'ALL') {
            chips.push({
                id: 'status',
                label: `Status: ${filters.status === 'OPEN' ? 'Open' : 'Closed'}`,
                onRemove: () => setFilter('status', 'ALL'),
                color: 'blue'
            });
        }
        if (filters.project !== 'ALL') {
            const project = projects.find(p => p.id === filters.project);
            chips.push({
                id: 'project',
                label: `Project: ${project?.name || 'Unknown'}`,
                onRemove: () => setFilter('project', 'ALL'),
                color: 'indigo'
            });
        }
        if (filters.datePreset !== 'ALL') {
            chips.push({
                id: 'date',
                label: `Date: ${PRESET_LABELS[filters.datePreset] || 'Custom'}`,
                onRemove: () => { setFilter('datePreset', 'ALL'); setFilter('dateRange', { start: '', end: '' }); },
                color: 'slate'
            });
        }
        return chips;
    }, [filters, projects, setFilter]);

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
                <StatCard
                    label="Total Active POs"
                    value={stats.total}
                    icon={FileText}
                    color="blue"
                    className="min-w-[140px] sm:min-w-0"
                />
                <StatCard
                    label="Pending Approval"
                    value={stats.open}
                    icon={Hourglass}
                    color="amber"
                    className="min-w-[140px] sm:min-w-0"
                />
                <StatCard
                    label="Delivered This Month"
                    value={stats.closed}
                    icon={Truck}
                    color="green"
                    className="min-w-[140px] sm:min-w-0"
                />
                <StatCard
                    label="Total Spend (YTD)"
                    value={formatCurrency(stats.totalValue, true)}
                    icon={DollarSign}
                    color="slate"
                    className="min-w-[140px] sm:min-w-0"
                />
            </div>

            {/* Filters */}
            <div className="space-y-2">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                    <div className="flex items-center gap-2 w-full lg:w-auto flex-grow lg:flex-1 min-w-0">
                        <SearchInput
                            value={filters.search}
                            onChange={(val) => setFilter('search', val)}
                            placeholder="Search PO, Project..."
                            className="flex-grow min-w-0"
                        />
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex-none h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Desktop Filters / Mobile Collapsible */}
                    <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto`}>
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

                <ActiveFilters
                    chips={activeFilterChips}
                    onClearAll={resetFilters}
                />
            </div>

            {/* Content */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No purchase orders found"
                    description={
                        (activeFilterChips.length > 0 || filters.search)
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
                            onRowClick={(po) => navigate(`/accountant/procurement/purchase-orders/${po.id}`)}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {filteredOrders.map(po => (
                            <MobileListCard
                                key={po.id}
                                title={po.poNumber}
                                subtitle={po.projectName}
                                status={<StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />}
                                date={po.createdAt}
                                amount={po.totalValue}
                                onClick={() => navigate(`/accountant/procurement/purchase-orders/${po.id}`)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrders;
