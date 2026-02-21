import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { Package, AlertCircle, CheckCircle, Clock, Building, ArrowRight, Truck } from 'lucide-react';
import { useProjects } from '@/hooks/queries/useProjects';
import { usePurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { PurchaseOrderResponse } from '@/services/procurementService';
import { ProjectCard } from '../common/ProjectCard';
import { DeliveryStats } from './DeliveryStats';

interface DeliveryListProps {
    role: 'ENGINEER' | 'MANAGER' | 'ACCOUNTANT';
}

export const DeliveryList: React.FC<DeliveryListProps> = ({ role }) => {
    const [searchParams] = useSearchParams();
    const projectIdParam = searchParams.get('projectId');
    const projectId = projectIdParam ? parseInt(projectIdParam) : undefined;
    const navigateRole = useRoleNavigate();

    // Queries
    const { data: projects = [], isLoading: loadingProjects, error: projectsError } = useProjects();
    const {
        data: purchaseOrders = [],
        isLoading: loadingPOs,
        error: poError
    } = usePurchaseOrders(projectId);

    // Derived state
    const selectedProject = projectId ? projects.find(p => p.id === projectId) || null : null;
    const loading = loadingProjects || (!!projectId && loadingPOs);
    const error = (projectsError as Error)?.message || (poError as Error)?.message || null;

    // Redirect if only one project and no project selected
    useEffect(() => {
        if (!loadingProjects && !projectId && projects.length === 1) {
            navigateRole(`/deliveries?projectId=${projects[0].id}`, { replace: true });
        }
    }, [projectId, projects, loadingProjects, navigateRole]);

    const handleProjectSelect = (id: number) => {
        navigateRole(`/deliveries?projectId=${id}`);
    };

    const clearProjectSelection = () => {
        navigateRole(`/deliveries`);
    };

    const getDeliveryProgress = (po: PurchaseOrderResponse) => {
        const totalOrdered = po.items.reduce((sum, item) => sum + item.orderedQty, 0);
        const totalDelivered = po.items.reduce((sum, item) => sum + item.totalDelivered, 0);
        return {
            ordered: totalOrdered,
            delivered: totalDelivered,
            percentage: totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0
        };
    };

    const getDeliveryStatusIcon = (po: PurchaseOrderResponse) => {
        const progress = getDeliveryProgress(po);
        if (po.status === 'CLOSED' || progress.percentage === 100) {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
        if (progress.percentage > 0) {
            return <Clock className="h-5 w-5 text-yellow-600" />;
        }
        return <Package className="h-5 w-5 text-blue-600" />;
    };

    const getDeliveryStatusText = (po: PurchaseOrderResponse) => {
        const progress = getDeliveryProgress(po);
        if (po.status === 'CLOSED' || progress.percentage === 100) return 'Fully Delivered';
        if (progress.percentage > 0) return `${progress.percentage}% Delivered`;
        return 'Awaiting Delivery';
    };

    const getDeliveryStatusColor = (po: PurchaseOrderResponse) => {
        const progress = getDeliveryProgress(po);
        if (po.status === 'CLOSED' || progress.percentage === 100) return 'border-green-200 bg-green-50/10';
        if (progress.percentage > 0) return 'border-yellow-200 bg-yellow-50/10';
        return 'border-blue-200 bg-blue-50/10';
    };

    // Stats calculations
    const stats = useMemo(() => {
        return {
            total: purchaseOrders.length,
            fullyDelivered: purchaseOrders.filter(po => po.status === 'CLOSED' || getDeliveryProgress(po).percentage === 100).length,
            partial: purchaseOrders.filter(po => {
                const progress = getDeliveryProgress(po);
                return progress.percentage > 0 && progress.percentage < 100 && po.status !== 'CLOSED';
            }).length,
            awaiting: purchaseOrders.filter(po => getDeliveryProgress(po).percentage === 0 && po.status !== 'CLOSED').length
        };
    }, [purchaseOrders]);


    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" text="Loading delivery data..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-sm font-medium text-red-600 hover:text-red-800 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Project Selection View
    if (!projectId && projects.length > 0) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                        {role === 'ENGINEER' ? 'Delivery Verification' : 'Track Deliveries'}
                    </h1>
                    <p className="text-slate-500">Select a project to view delivery status.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => handleProjectSelect(project.id)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Main Dashboard View (Project Selected)
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-3">
                        <Truck className="h-7 w-7 text-indigo-600" />
                        {role === 'ENGINEER' ? 'Delivery Verification' : 'Delivery Tracking'}
                    </h1>
                    {selectedProject && (
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {selectedProject.name}
                        </p>
                    )}
                </div>
                {projects.length > 1 && (
                    <button
                        onClick={clearProjectSelection}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Change Project
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <DeliveryStats stats={stats} />

            {/* Purchase Orders List */}
            {purchaseOrders.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <EmptyState
                        icon={Package}
                        title="No Purchase Orders"
                        description="There are no purchase orders to track for this project yet."
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="font-semibold text-slate-900">Purchase Orders</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {purchaseOrders.map((po) => {
                            const progress = getDeliveryProgress(po);
                            return (
                                <div
                                    key={po.id}
                                    onClick={() => navigateRole(`/deliveries/${po.id}?projectId=${projectId}`)}
                                    className={`group relative flex flex-col gap-4 rounded-lg border-2 bg-white p-5 transition-all hover:shadow-md cursor-pointer ${getDeliveryStatusColor(po)}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-white p-2 shadow-sm">
                                                {getDeliveryStatusIcon(po)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 line-clamp-1" title={po.poNumber}>{po.poNumber}</h3>
                                                <p className="text-sm text-slate-600">{getDeliveryStatusText(po)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Value and Date */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Value</p>
                                            <p className="font-medium text-slate-900">{formatCurrency(po.totalValue)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-500">Date</p>
                                            <p className="font-medium text-slate-900">{formatDate(po.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-slate-600">
                                            <span>Progress</span>
                                            <span>{progress.percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-green-500' : progress.percentage > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="space-y-2 pt-2">
                                        {po.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-700 truncate max-w-[150px]" title={item.materialDisplayName}>
                                                    {item.materialDisplayName}
                                                </span>
                                                <span className="text-slate-500">
                                                    {item.totalDelivered}/{item.orderedQty}
                                                </span>
                                            </div>
                                        ))}
                                        {po.items.length > 3 && (
                                            <p className="text-xs text-center text-slate-500 pt-1">
                                                + {po.items.length - 3} more items
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
