import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Plus, AlertCircle, Building, ArrowRight, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../lib/formatters';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useProjects } from '@/hooks/queries/useProjects';
import { usePurchaseOrders } from '@/hooks/queries/usePurchaseOrders';

/**
 * Procurement Dashboard - Shared by Project Owner and Accountant.
 * Displays active purchase orders and provides navigation to create new ones.
 */
const ProcurementDashboard: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const projectId = searchParams.get('projectId');

    // Determine base path based on user role
    const basePath = user?.role === 'ACCOUNTANT' ? '/accountant' : '/manager';

    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
    const {
        data: purchaseOrders = [],
        isLoading: posLoading,
        error: posError
    } = usePurchaseOrders(
        projectId ? Number(projectId) : undefined,
        { enabled: !!projectId }
    );

    const loading = projectId ? posLoading : projectsLoading;
    const error = (projectsError as Error)?.message || (posError as Error)?.message || null;

    // Show project selection if no project ID is in URL
    const showProjectSelection = !projectId;

    useEffect(() => {
        if (!projectId && !projectsLoading && projects.length === 1) {
            // Auto-redirect if only one project
            navigate(`${basePath}/procurement?projectId=${projects[0].id}`, { replace: true });
        }
    }, [projectId, projects, projectsLoading, navigate, basePath]);


    const handleProjectSelect = (id: number) => {
        navigate(`${basePath}/procurement?projectId=${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    if (showProjectSelection) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Select Project</h1>
                    <p className="text-slate-500">Choose a project to manage procurement.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="group relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="rounded-full bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Building className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-1">{project.siteLocation || project.region || 'No location'}</p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${project.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine stats
    const totalPOs = purchaseOrders.length;
    const openPOs = purchaseOrders.filter(po => po.status === 'OPEN').length;
    const closedPOs = purchaseOrders.filter(po => po.status === 'CLOSED').length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Procurement Dashboard</h1>
                    <p className="text-slate-500">Manage purchase orders and active procurements.</p>
                </div>
                <button
                    onClick={() => navigate(`${basePath}/procurement/create?projectId=${projectId}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Purchase Order
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Orders"
                    value={totalPOs}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatCard
                    label="Open Orders"
                    value={openPOs}
                    icon={Clock}
                    color="purple"
                />
                <StatCard
                    label="Completed"
                    value={closedPOs}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    label="Total Value"
                    value={formatCurrency(totalValue)}
                    icon={DollarSign}
                    color="amber"
                />
            </div>

            {/* Orders List */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h3 className="font-semibold text-slate-900">Recent Purchase Orders</h3>
                </div>

                {purchaseOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">PO Number</th>
                                    <th className="px-6 py-3 font-medium">Vendor</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {purchaseOrders.map((po) => (
                                    <tr
                                        key={po.id}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`${basePath}/procurement/${po.id}?projectId=${projectId}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-indigo-600">{po.poNumber}</td>
                                        <td className="px-6 py-4 text-slate-900">{po.vendorName}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {formatDate(po.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${po.status === 'OPEN'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-green-50 text-green-700'
                                                }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-900 font-medium">
                                            {formatCurrency(po.totalValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={ShoppingCart}
                        title="No Orders Found"
                        description="No purchase orders have been created for this project yet."
                        action={{
                            label: "Create First Order",
                            onClick: () => navigate(`${basePath}/procurement/create?projectId=${projectId}`)
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProcurementDashboard;
