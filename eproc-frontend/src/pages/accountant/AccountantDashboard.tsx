
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
import { formatCurrency, formatDate } from '@/lib/formatters';
import { MonthlySpendChart } from '@/components/domain/dashboard/MonthlySpendChart';
import { BudgetOverviewList } from '@/components/domain/dashboard/BudgetOverviewList';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable } from '@/components/common/DataTable';
import { MobileListCard } from '@/components/common/MobileListCard';
import type { ColumnDef } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { useAccountantDashboard } from '@/hooks/queries/useDashboard';
import type { AccountantDashboardData } from '@/hooks/queries/useDashboard';

type RecentPO = AccountantDashboardData['recentPOs'][0];

// Column definitions
const poColumns: ColumnDef<RecentPO>[] = [
    {
        id: 'poNumber',
        header: 'PO #',
        cell: (po) => (
            <span className="font-semibold text-[#2a3455] text-xs lg:text-sm">{po.poNumber}</span>
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

    const {
        data: dashboardData,
        isLoading,
    } = useAccountantDashboard();

    const stats = dashboardData?.stats;
    const recentPOs = dashboardData?.recentPOs ?? [];
    const recentApprovedRequests = dashboardData?.recentApprovedRequests ?? [];
    const monthlySpend = dashboardData?.monthlySpend ?? [];
    const budgetOverview = dashboardData?.budgetOverview ?? [];
    const alerts = dashboardData?.alerts ?? [];

    if (isLoading) {
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
                <div className="flex justify-end gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={() => navigate('/accountant/procurement')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline mr-2" />
                        <span className="hidden sm:inline">View Procurement</span>
                        <span className="sm:hidden">Procurement</span>
                    </button>
                    <button
                        onClick={() => navigate('/accountant/procurement/create')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#2a3455] rounded-md hover:bg-[#1e253e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline mr-2" />
                        <span className="hidden sm:inline">Create Purchase Order</span>
                        <span className="sm:hidden">New PO</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

                {/* Active POs (OPEN) */}
                <StatCard
                    label="Active Orders"
                    value={stats?.openPOsCount || 0}
                    icon={ShoppingCart}
                    color="blue"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Partially Delivered */}
                <StatCard
                    label="Partially Delivered"
                    value={stats?.partiallyDeliveredCount || 0}
                    icon={Clock}
                    color="amber"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Delivered (fully delivered + closed) */}
                <StatCard
                    label="Delivered"
                    value={stats?.deliveredCount || 0}
                    icon={CheckCircle}
                    color="green"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow"
                />

                {/* Total Ordered Value */}
                <StatCard
                    label="Total Ordered Value"
                    value={formatCurrency(stats?.totalCommittedValue || 0, true)}
                    icon={DollarSign}
                    color="slate"
                    className="min-w-[140px] sm:min-w-0 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1"
                />
            </div>

            {/* Dashboard Content Grid */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start mt-6">
                {/* Main Content Column (2 cols) */}
                <div className="contents lg:block lg:col-span-2 lg:space-y-6">
                    {/* Monthly Spend Chart */}
                    <div className="bg-white rounded-lg border border-slate-200 order-5 lg:order-none">
                        <MonthlySpendChart data={monthlySpend} />
                    </div>

                    {/* Recent PO Activity */}
                    <div className="bg-white rounded-lg border border-slate-200 order-3 lg:order-none">
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
                            <div className="hidden md:block">
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
                            <div className="md:hidden p-4 space-y-3">
                                {recentPOs.length > 0 ? (
                                    recentPOs.map(po => (
                                        <MobileListCard
                                            key={po.id}
                                            title={po.poNumber}
                                            subtitle={po.projectName}
                                            status={<StatusBadge status={po.status} type="po" className="text-[10px]" />}
                                            date={po.updatedAt}
                                            amount={po.totalValue}
                                            onClick={() => navigate(`/accountant/procurement/purchase-orders/${po.id}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-500 text-sm">
                                        No purchase orders found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Approved Requests */}
                    <div className="bg-white rounded-lg border border-slate-200 p-5 order-4 lg:order-none">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Approved Requests</h2>
                        </div>
                        <div className="space-y-3">
                            {recentApprovedRequests.length > 0 ? (
                                recentApprovedRequests.map((req) => (
                                    <MobileListCard
                                        key={req.id}
                                        title={req.title}
                                        subtitle={`${req.projectName} - ${req.siteName} (By ${req.createdByName})`}
                                        status={<StatusBadge status="APPROVED" type="request" className="text-[10px]" />}
                                        date={req.updatedAt}
                                        onClick={() => navigate(`/accountant/procurement/requests/${req.id}`)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No recent approved requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1 col) */}
                <div className="contents lg:block lg:col-span-1 lg:space-y-6">
                    {/* Budget Overview */}
                    <div className="order-2 lg:order-none">
                        <BudgetOverviewList data={budgetOverview} />
                    </div>

                    {/* Alerts & Flags */}
                    {alerts.length > 0 && (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden order-1 lg:order-none">
                            <div className="p-4 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Alerts & Flags</h2>
                                </div>
                                <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 border-none">
                                    {alerts.length}
                                </Badge>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {alerts.map((alert, index) => (
                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${alert.severity === 'danger' ? 'bg-red-500' :
                                                alert.severity === 'warning' ? 'bg-amber-500' :
                                                    'bg-slate-400'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                                                {alert.referenceId && (
                                                    <button className="text-xs font-medium text-slate-900 mt-2 hover:underline">
                                                        Reference #{alert.referenceId}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-3 text-center bg-slate-50/50">
                                    <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                        View All Alerts
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
