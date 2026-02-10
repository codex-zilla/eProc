import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    FileText,
    Loader2,
    AlertCircle,
    Plus,
    ArrowRight,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

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
    projectName: string;
    totalValue: number;
    createdAt: string;
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
                        { id: 1, poNumber: 'PO-2026-001', projectName: 'Residential Complex A', totalValue: 5600000, createdAt: '2026-02-10T10:30:00' },
                        { id: 2, poNumber: 'PO-2026-002', projectName: 'Commercial Building', totalValue: 3200000, createdAt: '2026-02-09T14:15:00' },
                        { id: 3, poNumber: 'PO-2026-003', projectName: 'Infrastructure Project', totalValue: 8900000, createdAt: '2026-02-08T09:45:00' },
                    ]);

                    setRecentDeliveries([
                        { id: 1, poNumber: 'PO-2026-001', deliveredDate: '2026-02-10T11:00:00', itemCount: 5 },
                        { id: 2, poNumber: 'PO-2025-089', deliveredDate: '2026-02-09T16:30:00', itemCount: 3 },
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-TZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-TZ', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2a3455]" />
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
                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">APPROVED</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">{stats?.approvedCount || 0}</p>
                        <p className="text-sm text-slate-500 mt-1">Approved Requests</p>
                    </div>
                </div>

                {/* Ordered Requests */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">ORDERED</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">{stats?.orderedCount || 0}</p>
                        <p className="text-sm text-slate-500 mt-1">Ordered Requests</p>
                    </div>
                </div>

                {/* Partially Delivered */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">PARTIAL</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">{stats?.partiallyDeliveredCount || 0}</p>
                        <p className="text-sm text-slate-500 mt-1">Partially Delivered</p>
                    </div>
                </div>

                {/* Fully Delivered */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">DELIVERED</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">{stats?.fullyDeliveredCount || 0}</p>
                        <p className="text-sm text-slate-500 mt-1">Fully Delivered</p>
                    </div>
                </div>

                {/* Total Ordered Value */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-[#2a3455]/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#2a3455]" />
                        </div>
                        <span className="text-xs font-medium text-[#2a3455] bg-[#2a3455]/5 px-2 py-1 rounded">TOTAL</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(stats?.totalOrderedValue || 0)}</p>
                        <p className="text-sm text-slate-500 mt-1">Total Ordered Value</p>
                    </div>
                </div>
            </div>

            {/* Alerts & Flags */}
            {(stats && (stats.underOrderedCount > 0 || stats.overDeliveredCount > 0 || stats.damagedDeliveriesCount > 0)) && (
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-slate-900">Alerts & Flags</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.underOrderedCount > 0 && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900">{stats.underOrderedCount} Under-ordered</p>
                                        <p className="text-xs text-yellow-700 mt-1">Ordered less than requested</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stats.overDeliveredCount > 0 && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-orange-900">{stats.overDeliveredCount} Over-delivered</p>
                                        <p className="text-xs text-orange-700 mt-1">Delivered more than ordered</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stats.damagedDeliveriesCount > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-900">{stats.damagedDeliveriesCount} Damaged Items</p>
                                        <p className="text-xs text-red-700 mt-1">Deliveries with damage reported</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Purchase Orders */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Purchase Orders</h2>
                        <button
                            onClick={() => navigate('/accountant/purchase-orders')}
                            className="text-sm text-[#2a3455] hover:text-[#1e253e] font-medium flex items-center gap-1"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentPOs.length > 0 ? (
                            recentPOs.map((po) => (
                                <div
                                    key={po.id}
                                    onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">{po.poNumber}</p>
                                            <p className="text-xs text-slate-600 mt-1 truncate">{po.projectName}</p>
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(po.totalValue)}</p>
                                            <p className="text-xs text-slate-500 mt-1">{formatDate(po.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent purchase orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Deliveries</h2>
                        <button
                            onClick={() => navigate('/accountant/deliveries')}
                            className="text-sm text-[#2a3455] hover:text-[#1e253e] font-medium flex items-center gap-1"
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
        </div>
    );
};

export default AccountantDashboard;
