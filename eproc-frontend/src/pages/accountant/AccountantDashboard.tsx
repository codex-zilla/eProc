import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Mock data - replace with actual API calls when backend is ready
interface DashboardStats {
    approvedCount: number;
    orderedCount: number;
    partiallyDeliveredCount: number;
    fullyDeliveredCount: number;
    totalOrderedValue: number;
    underOrderedCount: number;
    overDeliveredCount: number;
    damagedDeliveriesCount: number;
}

interface RecentPO {
    id: number;
    poNumber: string;
    vendor: string;
    createdAt: string;
    amount: number;
    status: 'Received' | 'Partial' | 'Ordered' | 'Pending';
}

interface AlertItem {
    id: string;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info';
    actionText?: string;
}

interface RecentDelivery {
    id: number;
    poNumber: string;
    deliveredDate: string;
    itemCount: number;
}

const AccountantDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentPOs, setRecentPOs] = useState<RecentPO[]>([]);
    const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // TODO: Replace with actual API calls when backend endpoints are available
                // For now, using mock data
                setTimeout(() => {
                    setStats({
                        approvedCount: 24,
                        orderedCount: 18,
                        partiallyDeliveredCount: 8,
                        fullyDeliveredCount: 10,
                        totalOrderedValue: 45500000,
                        underOrderedCount: 3,
                        overDeliveredCount: 1,
                        damagedDeliveriesCount: 2
                    });

                    setRecentPOs([
                        { id: 1, poNumber: 'PO-23-089', vendor: 'Dangote Cement', createdAt: '2026-10-24T10:30:00', amount: 12500000, status: 'Received' },
                        { id: 2, poNumber: 'PO-23-090', vendor: 'Simba Steel', createdAt: '2026-10-23T14:15:00', amount: 4200000, status: 'Partial' },
                        { id: 3, poNumber: 'PO-23-091', vendor: 'Tanzania Electric', createdAt: '2026-10-22T09:45:00', amount: 850000, status: 'Ordered' },
                        { id: 4, poNumber: 'PO-23-092', vendor: 'Kiboko Paints', createdAt: '2026-10-21T16:00:00', amount: 1200000, status: 'Pending' },
                    ]);

                    setAlerts([
                        { id: '1', title: 'Over-delivered Item', description: 'PO-23-089: Received 550 bags of cement, ordered 500.', type: 'danger', actionText: 'Review Discrepancy' },
                        { id: '2', title: 'Under-ordered Rebar', description: 'Project plan requires +200kg for Phase 2 foundation.', type: 'warning' },
                        { id: '3', title: 'Pending Invoice Approval', description: 'Simba Steel invoice #4402 is awaiting your sign-off.', type: 'info' },
                    ]);

                    setRecentDeliveries([
                        { id: 1, poNumber: 'PO-23-089', deliveredDate: '2026-02-10T11:00:00', itemCount: 5 },
                        { id: 2, poNumber: 'PO-23-090', deliveredDate: '2026-02-09T16:30:00', itemCount: 3 },
                    ]);

                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Procurement and delivery overview</p>
                </div>
                <div className="flex gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Approved Requests */}
                <StatCard
                    label="Approved Requests"
                    value={stats?.approvedCount || 0}
                    icon={Clock}
                    color="slate"
                    className="hover:shadow-md transition-shadow"
                />

                {/* Ordered Requests */}
                <StatCard
                    label="Ordered Requests"
                    value={stats?.orderedCount || 0}
                    icon={ShoppingCart}
                    color="blue"
                    className="hover:shadow-md transition-shadow"
                />

                {/* Partially Delivered */}
                <StatCard
                    label="Partially Delivered"
                    value={stats?.partiallyDeliveredCount || 0}
                    icon={Package}
                    color="amber"
                    className="hover:shadow-md transition-shadow"
                />

                {/* Fully Delivered */}
                <StatCard
                    label="Fully Delivered"
                    value={stats?.fullyDeliveredCount || 0}
                    icon={CheckCircle}
                    color="green"
                    className="hover:shadow-md transition-shadow"
                />

                {/* Total Ordered Value */}
                <StatCard
                    label="Total Ordered Value"
                    value={formatCurrency(stats?.totalOrderedValue || 0)}
                    icon={DollarSign}
                    color="slate"
                    className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1"
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
                                onClick={() => navigate('/accountant/purchase-orders')}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">PO #</th>
                                        <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">VENDOR</th>
                                        <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider">DATE</th>
                                        <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider text-right">AMOUNT (TZS)</th>
                                        <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentPOs.length > 0 ? (
                                        recentPOs.map((po) => (
                                            <tr key={po.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}>
                                                <td className="px-5 py-4 font-medium text-slate-900">{po.poNumber}</td>
                                                <td className="px-5 py-4 text-slate-600">{po.vendor}</td>
                                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(po.createdAt)}</td>
                                                <td className="px-5 py-4 text-right text-slate-900 font-medium whitespace-nowrap">{formatCurrency(po.amount)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${po.status === 'Received' ? 'bg-green-100 text-green-800' :
                                                        po.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            po.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-slate-100 text-slate-800'
                                                        }`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                                                No recent purchase orders found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                                recentDeliveries.map((delivery) => (
                                    <div
                                        key={delivery.id}
                                        onClick={() => navigate('/accountant/deliveries')}
                                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{delivery.poNumber}</p>
                                                <p className="text-xs text-slate-600 mt-1">{delivery.itemCount} items delivered</p>
                                            </div>
                                            <div className="text-right ml-3">
                                                <p className="text-xs text-slate-500">{formatDateTime(delivery.deliveredDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No recent deliveries</p>
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
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
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
