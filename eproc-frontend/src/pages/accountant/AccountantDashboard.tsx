import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
    ArrowRight,
    DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable } from '@/components/common/DataTable';
import type { ColumnDef } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAllPurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import { useAccountantDashboard } from '@/hooks/queries/useDashboard';
import type { PurchaseOrder } from '@/types/models';
import { computeAccountantDashboardStats } from '@/lib/po-stats';

// Column definitions use the real PurchaseOrder type
const poColumns: ColumnDef<PurchaseOrder>[] = [
    {
        id: 'poNumber',
        header: 'PO #',
        cell: (po) => (
            <span className="font-semibold text-[#2a3455] text-xs lg:text-sm">{po.poNumber}</span>
        ),
    },
    {
        id: 'vendor',
        header: 'Vendor',
        cell: (po) => (
            <span className="text-slate-600 text-xs lg:text-sm">{po.vendorName || '—'}</span>
        ),
    },
    {
        id: 'project',
        header: 'Project',
        cell: (po) => (
            <span className="text-slate-600 text-xs lg:text-sm">{po.projectName}</span>
        ),
    },
    {
        id: 'createdAt',
        header: 'Date',
        cell: (po) => <span className="text-slate-500 whitespace-nowrap text-xs lg:text-sm">{formatDate(po.createdAt)}</span>,
    },
    {
        id: 'totalValue',
        header: 'Amount (TZS)',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (po) => (
            <span className="whitespace-nowrap font-bold text-slate-900 font-mono text-xs lg:text-sm">
                {formatCurrency(po.totalValue)}
            </span>
        ),
    },
    {
        id: 'status',
        header: 'Status',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (po) => (
            <div className="flex justify-end">
                <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />
            </div>
        ),
    }
];

const AccountantDashboard = () => {
    const navigate = useNavigate();

    // Real PO data
    const {
        data: purchaseOrders = [],
        isLoading: loadingPOs,
    } = useAllPurchaseOrders();

    // Mock alerts – no real backend endpoint yet
    const {
        data: dashboardData,
        isLoading: loadingDashboard,
    } = useAccountantDashboard();

    const alerts = dashboardData?.alerts ?? [];

    // Compute stats from real POs
    const stats = useMemo(
        () => computeAccountantDashboardStats(purchaseOrders),
        [purchaseOrders]
    );

    // 5 most recent POs (sorted newest-first)
    const recentPOs = useMemo(
        () =>
            [...purchaseOrders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5),
        [purchaseOrders]
    );

    // Delivered / partially-delivered POs as "recent deliveries"
    const recentDeliveries = useMemo(
        () =>
            purchaseOrders
                .filter(po => po.status === 'DELIVERED' || po.status === 'PARTIALLY_DELIVERED')
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5),
        [purchaseOrders]
    );

    const loading = loadingPOs || loadingDashboard;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Procurement and delivery overview</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={() => navigate('/accountant/procurement')}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <ShoppingCart className="h-4 w-4 inline mr-2" />
                        View Procurement
                    </button>
                    <button
                        onClick={() => navigate('/accountant/procurement/create')}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#2a3455] rounded-md hover:bg-[#1e253e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Create Purchase Order
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

                {/* Active POs (OPEN) */}
                <StatCard
                    label="Active Orders"
                    value={stats.orderedCount}
                    icon={ShoppingCart}
                    color="blue"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Partially Delivered */}
                <StatCard
                    label="Partially Delivered"
                    value={stats.partialCount}
                    icon={Clock}
                    color="amber"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Delivered (fully delivered + closed) */}
                <StatCard
                    label="Delivered"
                    value={stats.deliveredCount}
                    icon={CheckCircle}
                    color="green"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Total Ordered Value */}
                <StatCard
                    label="Total Ordered Value"
                    value={formatCurrency(stats.totalOrderedValue, true)}
                    icon={DollarSign}
                    color="slate"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1"
                />
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent PO Activity */}
                    <div className="bg-white rounded-lg border border-slate-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-900">Recent PO Activity</h2>
                            <button
                                onClick={() => navigate('/accountant/procurement/purchase-orders')}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-0">
                            <DataTable
                                data={recentPOs}
                                columns={poColumns}
                                keyExtractor={(po) => po.id}
                                onRowClick={(po) => navigate(`/accountant/procurement/purchase-orders/${po.id}`)}
                                emptyMessage="No purchase orders found"
                                className="border-0 rounded-none shadow-none"
                                headerClassName="bg-slate-50 text-slate-500 font-medium border-b border-slate-100"
                            />
                        </div>
                    </div>

                    {/* Recent Deliveries */}
                    <div className="bg-white rounded-lg border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Deliveries</h2>
                            <button
                                onClick={() => navigate('/accountant/deliveries')}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentDeliveries.length > 0 ? (
                                recentDeliveries.map((po) => (
                                    <div
                                        key={po.id}
                                        onClick={() => navigate(`/accountant/procurement/purchase-orders/${po.id}`)}
                                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{po.poNumber}</p>
                                                <p className="text-xs text-slate-600 mt-0.5 truncate">{po.projectName}</p>
                                            </div>
                                            <div className="text-right ml-3 flex-shrink-0">
                                                <StatusBadge status={po.status} type="po" className="text-[10px]" />
                                                <p className="text-xs text-slate-400 mt-1">{formatDateTime(po.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No deliveries recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1 col) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Alerts & Flags */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h2 className="text-lg font-semibold text-slate-900">Alerts & Flags</h2>
                            </div>
                            {alerts.length > 0 && (
                                <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 border-none">
                                    {alerts.length}
                                </Badge>
                            )}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${alert.type === 'danger' ? 'bg-red-500' :
                                                alert.type === 'warning' ? 'bg-amber-500' :
                                                    'bg-slate-400'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</p>
                                                {alert.actionText && (
                                                    <button className="text-xs font-medium text-slate-900 mt-2 hover:underline">
                                                        {alert.actionText}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <p className="text-sm">No active alerts</p>
                                </div>
                            )}
                            <div className="p-3 text-center bg-slate-50/50">
                                <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                    View All Alerts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
