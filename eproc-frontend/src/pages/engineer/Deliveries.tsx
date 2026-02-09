import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Loader2, AlertCircle, CheckCircle, Clock, Building, ArrowRight } from 'lucide-react';
import {
    getProjectPurchaseOrders,
    type PurchaseOrderResponse,
} from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/models';

/**
 * Deliveries page for Engineers.
 * Shows incoming purchase orders that need verification.
 */
const Deliveries: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get('projectId');

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Project selection state
    const [projects, setProjects] = useState<Project[]>([]);
    const [showProjectSelection, setShowProjectSelection] = useState(false);

    useEffect(() => {
        if (!projectId) {
            fetchProjects();
        } else {
            loadPurchaseOrders();
        }
    }, [projectId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProjects();

            if (data.length === 0) {
                setError('No active projects found.');
                setLoading(false);
            } else if (data.length === 1) {
                navigate(`/engineer/deliveries?projectId=${data[0].id}`, { replace: true });
            } else {
                setProjects(data);
                setShowProjectSelection(true);
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setError('Failed to load projects. Please try again.');
            setLoading(false);
        }
    };

    const loadPurchaseOrders = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setShowProjectSelection(false);
            const data = await getProjectPurchaseOrders(Number(projectId));
            setPurchaseOrders(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to load purchase orders:', err);
            setError(err.response?.data?.message || 'Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const getDeliveryStatusIcon = (po: PurchaseOrderResponse) => {
        if (po.status === 'CLOSED') {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
        const hasPartialDelivery = po.items.some(item => item.totalDelivered > 0);
        if (hasPartialDelivery) {
            return <Clock className="h-5 w-5 text-yellow-600" />;
        }
        return <Package className="h-5 w-5 text-blue-600" />;
    };

    const getDeliveryStatusText = (po: PurchaseOrderResponse) => {
        if (po.status === 'CLOSED') return 'Fully Delivered';
        const hasPartialDelivery = po.items.some(item => item.totalDelivered > 0);
        if (hasPartialDelivery) return 'Partially Delivered';
        return 'Pending Delivery';
    };

    const getDeliveryStatusColor = (po: PurchaseOrderResponse) => {
        if (po.status === 'CLOSED') return 'bg-green-50 border-green-200';
        const hasPartialDelivery = po.items.some(item => item.totalDelivered > 0);
        if (hasPartialDelivery) return 'bg-yellow-50 border-yellow-200';
        return 'bg-blue-50 border-blue-200';
    };

    const handleProjectSelect = (id: number) => {
        navigate(`/engineer/deliveries?projectId=${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (showProjectSelection) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Select Project</h1>
                    <p className="text-slate-500">Choose a project to view deliveries.</p>
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

    const openOrders = purchaseOrders.filter(po => po.status === 'OPEN');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Delivery Verification</h1>
                    <p className="text-slate-500">Verify incoming deliveries and confirm quantities</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Deliveries</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{openOrders.length}</p>
                        </div>
                        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{purchaseOrders.length}</p>
                        </div>
                        <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {purchaseOrders.filter(po => po.status === 'CLOSED').length}
                            </p>
                        </div>
                        <div className="rounded-full bg-green-50 p-3 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Orders List */}
            <div className="space-y-4">
                {purchaseOrders.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <Package className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-slate-900">No deliveries to verify</h3>
                        <p className="text-slate-500">Incoming deliveries will appear here</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {purchaseOrders.map((po) => (
                            <div
                                key={po.id}
                                onClick={() => navigate(`/engineer/deliveries/${po.id}?projectId=${projectId}`)}
                                className={`group relative flex flex-col gap-4 rounded-lg border-2 bg-white p-6 transition-all hover:shadow-md cursor-pointer ${getDeliveryStatusColor(po)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-white p-2 shadow-sm">
                                            {getDeliveryStatusIcon(po)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{po.poNumber}</h3>
                                            <p className="text-sm text-slate-600">{getDeliveryStatusText(po)}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.totalValue)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Vendor</p>
                                        <p className="font-medium text-slate-900 truncate">{po.vendorName || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500">Date</p>
                                        <p className="font-medium text-slate-900">{new Date(po.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Items Progress */}
                                <div className="space-y-3 pt-2">
                                    {po.items.slice(0, 3).map((item) => {
                                        const progress = (item.totalDelivered / item.orderedQty) * 100;
                                        return (
                                            <div key={item.id} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{item.materialDisplayName}</span>
                                                    <span className="text-slate-500">
                                                        {item.totalDelivered} / {item.orderedQty} {item.unit}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${item.fullyDelivered ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {po.items.length > 3 && (
                                        <p className="text-xs text-center text-slate-500">
                                            + {po.items.length - 3} more items
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deliveries;
