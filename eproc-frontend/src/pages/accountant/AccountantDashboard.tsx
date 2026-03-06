
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import {
    ShoppingCart,
    CheckCircle,
    Clock,
    Plus,
    DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { MonthlySpendChart } from '@/components/domain/dashboard/MonthlySpendChart';
import { BudgetOverviewList } from '@/components/domain/dashboard/BudgetOverviewList';
import { SummaryStatGrid } from '@/components/common/SummaryStatGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
    DashboardAlerts,
    RecentPOsWidget,
    DashboardRequestsWidget
} from '@/components/domain/dashboard';
import { useAccountantDashboard } from '@/hooks/queries/useDashboard';

const AccountantDashboard = () => {
    const navigateRole = useRoleNavigate();

    const {
        data: dashboardData,
        isLoading,
    } = useAccountantDashboard();

    const stats = dashboardData?.stats;
    const monthlySpend = dashboardData?.monthlySpend ?? [];
    const budgetOverview = dashboardData?.budgetOverview ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    const data = dashboardData!; // Assert non-null after loading check

    return (
        <div className="space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-row items-end
             justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0 sm:mt-1">Procurement and delivery overview</p>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={() => navigateRole('/procurement')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline mr-2" />
                        <span className="hidden sm:inline">View Procurement</span>
                        <span className="sm:hidden">Procurement</span>
                    </button>
                    <button
                        onClick={() => navigateRole('/procurement/create')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#2a3455] rounded-md hover:bg-[#1e253e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline mr-2" />
                        <span className="hidden sm:inline">Create Purchase Order</span>
                        <span className="sm:hidden">New PO</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryStatGrid
                stats={[
                    {
                        label: "Active Orders",
                        value: stats?.openPOsCount || 0,
                        icon: ShoppingCart,
                        color: "blue",
                    },
                    {
                        label: "Partially Delivered",
                        value: stats?.partiallyDeliveredCount || 0,
                        icon: Clock,
                        color: "amber",
                    },
                    {
                        label: "Delivered",
                        value: stats?.deliveredCount || 0,
                        icon: CheckCircle,
                        color: "green",
                    },
                    {
                        label: "Total Ordered Value",
                        value: formatCurrency(stats?.totalCommittedValue || 0, true),
                        icon: DollarSign,
                        color: "slate",
                        className: "sm:col-span-2 lg:col-span-1"
                    }
                ]}
            />

            {/* Dashboard Content Grid */}
            <div className="mt-6">
                {/* Mobile & Tablet Layout (< 1024px) */}
                <div className="flex flex-col gap-6 lg:hidden">
                    {/* Alerts (Only shown if there are alerts) */}
                    {data.alerts && data.alerts.length > 0 && (
                        <div className="w-full">
                            <DashboardAlerts alerts={data.alerts} />
                        </div>
                    )}
                    <BudgetOverviewList data={budgetOverview} />
                    <RecentPOsWidget recentPOs={data.recentPOs} />
                    <DashboardRequestsWidget
                        title="Recent Approved Requests"
                        requests={data.recentApprovedRequests.map(r => ({
                            ...r,
                            status: 'APPROVED',
                            createdAt: r.updatedAt,
                            siteName: r.siteName || null
                        }))}
                        actionLabel="Process"
                        actionPath="/procurement/requests"
                    />

                    <div className="bg-white rounded-lg border border-slate-200">
                        <MonthlySpendChart data={monthlySpend} />
                    </div>
                </div>

                {/* Desktop Layout (>= 1024px) */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
                    {/* Main Content Column (2 cols) */}
                    <div className="flex flex-col col-span-2 gap-6">
                        <RecentPOsWidget recentPOs={data.recentPOs} />
                        <DashboardRequestsWidget
                            title="Recent Approved Requests"
                            requests={data.recentApprovedRequests.map(r => ({
                                ...r,
                                status: 'APPROVED',
                                createdAt: r.updatedAt,
                                siteName: r.siteName || null
                            }))}
                            actionLabel="Process"
                            actionPath="/procurement/requests"
                        />

                        <div className="bg-white rounded-lg border border-slate-200">
                            <MonthlySpendChart data={monthlySpend} />
                        </div>
                    </div>

                    {/* Sidebar Column (1 col) */}
                    <div className="flex flex-col col-span-1 gap-6">
                        {/* Alerts are always rendered on desktop sidebar (often hidden states inside) */}
                        <DashboardAlerts alerts={data.alerts} />
                        <BudgetOverviewList data={budgetOverview} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
