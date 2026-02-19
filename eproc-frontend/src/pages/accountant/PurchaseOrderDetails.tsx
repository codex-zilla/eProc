import { useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Loader2,
    Calendar,
    Filter,
    ShoppingCart,
    Truck,
    Edit,
    Clock,
    PieChart,
    Package,
    Check,
    Search,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatCurrency, formatNumber } from '../../lib/formatters';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { usePurchaseOrder, useClosePurchaseOrder } from '@/hooks/queries/usePurchaseOrders';
import { useRequest } from '@/hooks/queries/useRequests';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { useSort } from '@/hooks/useSort';
import { usePagination } from '@/hooks/usePagination';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
    LoadingSpinner, EmptyState, ErrorDisplay, DataTable, type ColumnDef,
    StatCard, FilterSelect, SearchInput, PaginationControls, ItemMobileCard,
} from '@/components/common';
import type { PurchaseOrderItem } from '@/types/models';
import { computePODetailStats, getProgressColor, isRequestFullyOrdered } from '@/lib/po-stats';

interface ItemFilters {
    search: string;
    status: 'all' | 'pending' | 'completed';
}

const PurchaseOrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const poId = Number(id);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // ── Filter / Search ──
    const { filters, setFilter } = useFilters<ItemFilters>({
        search: '',
        status: 'all',
    });
    const debouncedSearch = useDebounce(filters.search, 300);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);
    useClickOutside(searchContainerRef, closeSearch, isSearchOpen);

    const statusFilterOptions = useMemo(() => [
        { value: 'all' as const, label: 'All Items' },
        { value: 'pending' as const, label: 'Pending Delivery' },
        { value: 'completed' as const, label: 'Fully Delivered' },
    ], []);

    const {
        data: po,
        isLoading: loading,
        error,
        refetch,
    } = usePurchaseOrder(poId);
    const closeOrderMutation = useClosePurchaseOrder();

    // ── Fetch Request Data for "Update Order" Visibility ──
    const { data: request } = useRequest(po?.requestId ?? 0);
    const showUpdateOrderButton = !isRequestFullyOrdered(request);



    // ── Sort ──
    const { sortConfig, handleSort, sortItems } = useSort<PurchaseOrderItem>();

    // ── Actions ──
    const handleCloseOrder = async () => {
        if (!poId) return;
        try {
            await closeOrderMutation.mutateAsync(poId);
            toast.success('Purchase order closed successfully');
        } catch (error) {
        }
    };

    // ── Derived data ──
    const stats = useMemo(
        () => (po ? computePODetailStats(po.items) : null),
        [po]
    );

    const filteredItems = useMemo(() => {
        if (!po) return [];

        let items = po.items.filter(item => {
            const query = debouncedSearch.toLowerCase();
            const matchesSearch =
                item.materialDisplayName.toLowerCase().includes(query) ||
                (item.siteName && item.siteName.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            if (filters.status === 'pending') return item.totalDelivered < item.orderedQty;
            if (filters.status === 'completed') return item.totalDelivered >= item.orderedQty;
            return true;
        });

        return sortItems(items);
    }, [po, debouncedSearch, filters.status, sortItems]);

    // ── Pagination ──
    const pagination = usePagination({ totalItems: filteredItems.length });
    const showPagination = filteredItems.length > 10;
    const paginatedItems = showPagination
        ? filteredItems.slice(pagination.startIndex, pagination.endIndex)
        : filteredItems;

    // ── Table Columns ──
    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            id: 'material',
            header: 'Material',
            sortKey: 'materialDisplayName',
            cell: (item) => (
                <div className="flex items-start gap-2">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{item.materialDisplayName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Site: {item.siteName || 'N/A'}</p>
                    </div>
                </div>
            ),
            headerClassName: 'pr-0',
            className: 'pr-0',
        },
        {
            id: 'unitPrice',
            header: 'Unit Cost',
            sortKey: 'unitPrice',
            cell: (item) => (
                <span className="font-semibold text-slate-700 font-mono tracking-tight">{formatCurrency(item.unitPrice)}</span>
            ),
            headerClassName: 'pr-0 hidden lg:table-cell',
            className: 'pr-0 hidden lg:table-cell',
        },
        {
            id: 'requestedQty',
            header: 'Req. Qty',
            sortKey: 'requestedQty',
            cell: (item) => <span className="font-medium text-slate-700">{item.requestedQty}</span>,
            headerClassName: 'pr-0 text-center',
            className: 'pr-0 text-center',
        },
        {
            id: 'orderedQty',
            header: 'Ord. Qty',
            sortKey: 'orderedQty',
            cell: (item) => <span className="font-medium text-slate-700">{item.orderedQty}</span>,
            headerClassName: 'pr-0 text-center',
            className: 'pr-0 text-center',
        },
        {
            id: 'delivered',
            header: 'Delivered (of Req)',
            cell: (item) => {
                const percent = item.requestedQty > 0
                    ? Math.round((item.totalDelivered / item.requestedQty) * 100) : 0;
                return (
                    <div className="flex flex-col gap-1.5 max-w-[110px] lg:max-w-[200px]">
                        <div className="flex justify-between text-xs">
                            <span className={`font-semibold ${percent === 100 ? 'text-green-600' : 'text-slate-700'}`}>
                                {item.totalDelivered} ({percent}%)
                            </span>
                        </div>
                        <div className="h-2 w-full">
                            <Progress value={percent} className="h-full bg-slate-100" indicatorClassName={getProgressColor(percent)} />
                        </div>
                    </div>
                );
            },
            headerClassName: 'pr-0',
            className: 'pr-0',
        },
        // {
        //     id: 'remaining',
        //     header: 'Remaining',
        //     cell: (item) => {
        //         const remaining = item.orderedQty - item.totalDelivered;
        //         return (
        //             <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-slate-700'}`}>
        //                 {remaining}
        //             </span>
        //         );
        //     },
        //     headerClassName: 'text-center pr-0 hidden lg:table-cell',
        //     className: 'text-center pr-0 hidden lg:table-cell',
        // },
        {
            id: 'orderedDate',
            header: 'Date',
            sortKey: 'orderedDate',
            cell: (item) => (
                <span className="text-nowrap text-slate-600">{item.orderedDate ? formatDate(item.orderedDate) : '-'}</span>
            ),
            headerClassName: 'pr-0',
            className: 'pr-0',
        },
        {
            id: 'totalPrice',
            header: 'Total',
            cell: (item) => (
                <span className="font-semibold text-slate-700 font-mono tracking-tighte">{formatCurrency(item.totalPrice)}</span>
            ),
            headerClassName: 'pr-0',
            className: 'pr-0',
        },
    ], []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading purchase order..." />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error as Error}
                title="Failed to load purchase order"
                onRetry={refetch}
                onBack={() => navigate('/accountant/procurement/purchase-orders')}
                backLabel="Back to Purchase Orders"
            />
        );
    }

    if (!po) {
        return (
            <EmptyState
                icon={FileText}
                title="Purchase order not found"
                description="The purchase order you're looking for doesn't exist or has been removed."
                action={
                    <Button
                        variant="link"
                        onClick={() => navigate('/accountant/procurement/purchase-orders')}
                        className="mt-2 text-[#2a3455] hover:text-[#1e253e] font-medium"
                    >
                        Back to Purchase Orders
                    </Button>
                }
            />
        );
    }

    const isOrderClosed = po.status === 'CLOSED';
    const showCloseButton = !isOrderClosed;

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PARTIALLY_DELIVERED': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-4 min-w-0 pb-10">
            {/* Header Section */}
            <Card className='shadow-none bg-transparent border-0'>
                <CardContent className="p-0 sm:p-3">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-base lg:text-2xl font-bold text-[#2a3455] truncate"><span className='hidden sm:inline'>Purchase Order:</span> {po.poNumber}</h1>
                                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border shrink-0 ${getStatusBadgeVariant(po.status)}`}>
                                    {po.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5 me-3">
                                    <FileText className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                                    <span className='text-xs sm:text-sm'>Project: {po.projectName}</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                                    <span className='text-xs sm:text-sm'>Ordered: {formatDate(po.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full lg:w-auto shrink-0">
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                {/* <Button variant="outline" size="sm" className="flex-1 lg:flex-none gap-2 px-3 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                    <Printer className="h-3.5 w-3.5" />
                                    PDF
                                </Button> */}
                                {showCloseButton && (
                                    <>
                                        <Button
                                            onClick={handleCloseOrder}
                                            disabled={closeOrderMutation.isPending}
                                            size="sm"
                                            className="flex-1 lg:flex-none gap-2 px-3 bg-[#2a3455] border-slate-200 text-white hover:bg-[#1e253e] hover:text-white"
                                        >
                                            {closeOrderMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                            Complete Order
                                        </Button>

                                        {showUpdateOrderButton && (
                                            <Button
                                                onClick={() => navigate(`${location.pathname}/edit`)}
                                                size="sm"
                                                className="flex-1 lg:flex-none gap-2 px-3 bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Update Order
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="flex overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 no-scrollbar snap-x snap-mandatory scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <StatCard
                    icon={ShoppingCart}
                    label="Total Requested Items"
                    value={formatNumber(stats!.totalRequestedQty)}
                    color="slate"
                    subtitle="Requested Qty"
                    subtitleClassName="text-green-600"
                    className="min-w-[200px] sm:min-w-0 snap-center shrink-0"
                />
                <StatCard
                    icon={Truck}
                    label="Total Delivered"
                    value={formatNumber(stats!.totalDeliveredQty)}
                    color="green"
                    className="min-w-[200px] sm:min-w-0 snap-center shrink-0"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Progress value={stats!.deliveryPercentage} className="h-1.5 bg-slate-100" indicatorClassName={getProgressColor(stats!.deliveryPercentage)} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">{stats!.deliveryPercentage}%</span>
                    </div>
                </StatCard>
                <StatCard
                    icon={Clock}
                    label="Pending Delivery"
                    value={formatNumber(stats!.totalPendingDelivery)}
                    color="amber"
                    subtitle={`${stats!.pendingItemsCount} items require attention`}
                    subtitleClassName="text-amber-600"
                    className="min-w-[200px] sm:min-w-0 snap-center shrink-0"
                />
                <StatCard
                    icon={PieChart}
                    label="Total Expenses"
                    value={formatCurrency(po.totalValue)}
                    color="blue"
                    className="min-w-[200px] sm:min-w-0 snap-center shrink-0"
                />
            </div>

            {/* Ordered Items Table Section */}
            <Card className="flex flex-col shadow-none min-w-0 bg-transparent sm:bg-card border-none sm:border">
                <CardContent className="p-0">
                    <div className="p-2 sm:p-3 border-b border-slate-200 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
                            <div className={`flex items-center justify-between w-full sm:w-auto transition-opacity duration-200 ${isSearchOpen ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : 'opacity-100'}`}>
                                <h2 className="text-base sm:text-lg font-bold text-[#2a3455]">Ordered Items</h2>
                                <div className="flex items-center gap-1 sm:hidden">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-card border rounded-lg" onClick={() => setIsSearchOpen(true)}>
                                        <Search className="h-4 w-4 text-slate-500" />
                                    </Button>
                                    <FilterSelect
                                        value={filters.status}
                                        onChange={(val) => setFilter('status', val)}
                                        options={statusFilterOptions}
                                        label="Filter"
                                        icon={Filter}
                                        minimal={true}
                                    />
                                </div>
                            </div>
                            <div
                                ref={searchContainerRef}
                                className={`absolute inset-0 z-20 flex items-center gap-1 bg-white sm:hidden transition-all duration-300 origin-right ${isSearchOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 pointer-events-none'}`}
                            >
                                <SearchInput
                                    value={filters.search}
                                    onChange={(v) => setFilter('search', v)}
                                    placeholder="Search Material or Site..."
                                    className="flex-1 border-none"
                                    inputClassName="bg-slate-50 shadow-none focus-visible:ring-0"
                                    autoFocus={isSearchOpen}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 text-slate-500 hover:bg-slate-50 mr-1"
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close search</span>
                                </Button>
                            </div>
                            <div className="hidden sm:flex w-full sm:w-auto flex-col sm:flex-row gap-3">
                                <SearchInput
                                    value={filters.search}
                                    onChange={(v) => setFilter('search', v)}
                                    placeholder="Search Material or Site..."
                                    className="flex-1 lg:min-w-[300px]"
                                    inputClassName="bg-white"
                                />
                                <FilterSelect
                                    value={filters.status}
                                    onChange={(val) => setFilter('status', val)}
                                    options={statusFilterOptions}
                                    label="Filter"
                                    icon={Filter}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        {paginatedItems.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="No items match your filters"
                                description="Try adjusting your search or filter criteria."
                                className="py-12"
                            />
                        ) : (
                            <DataTable
                                data={paginatedItems}
                                columns={columns}
                                keyExtractor={(item) => item.id}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                                headerClassName="bg-[#2a3455]/10"
                                className="border-0 rounded-none"
                                footer={
                                    <div className="bg-slate-50/50 px-4 py-2 text-right text-sm font-semibold text-slate-900 tracking-wider border-t border-slate-200">
                                        Total:
                                        <span className="ps-2 text-lg font-bold font-mono text-[#2a3455] tracking-tighter">{formatCurrency(po.totalValue)}</span>
                                    </div>
                                }
                            />
                        )}
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3 bg-transparent">
                        {paginatedItems.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="No items match your filters"
                                description="Try adjusting your search or filter criteria."
                                className="py-12"
                            />
                        ) : (
                            paginatedItems.map(item => (
                                <ItemMobileCard key={item.id} item={item} />
                            ))
                        )}
                    </div>

                    {/* Pagination (conditional) */}
                    {showPagination && (
                        <PaginationControls
                            {...pagination}
                            totalFiltered={filteredItems.length}
                        />
                    )}

                    {/* Simple count when pagination is not shown */}
                    {!showPagination && filteredItems.length > 0 && (
                        <div className="p-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-500">
                                Showing all <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{po.items.length}</span> items
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
};

export default PurchaseOrderDetails;
