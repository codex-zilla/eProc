import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Loader2, AlertCircle, CheckCircle, Clock, Building, ArrowRight, Truck } from 'lucide-react';
import {
    getProjectPurchaseOrders,
    type PurchaseOrderResponse,
} from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/models';
import { useAuth } from '../../context/AuthContext';

/**
 * Delivery Tracking page for Project Owners and Accountants.
 * Shows delivery status of all purchase orders.
 */
const ManagerDeliveries: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const projectId = searchParams.get('projectId');

    // Determine base path based on user role
    const basePath = user?.role === 'ACCOUNTANT' ? '/accountant' : '/manager';

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Project selection state
    const [projects, setProjects] = useState<Project[]>([]);
    const [showProjectSelection, setShowProjectSelection] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
            // Use getAllProjects for manager
            const data = await projectService.getAllProjects();

            if (data.length === 0) {
                setError('No projects found.');
                setLoading(false);
            } else if (data.length === 1) {
                navigate(`${basePath}/deliveries?projectId=${data[0].id}`, { replace: true });
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

            // Get project info for header
            const projectData = await projectService.getAllProjects();
            const project = projectData.find((p: Project) => p.id === Number(projectId));
            setSelectedProject(project || null);

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

    const getDeliveryProgress = (po: PurchaseOrderResponse) => {
        const totalOrdered = po.items.reduce((sum, item) => sum + item.orderedQty, 0);
        const totalDelivered = po.items.reduce((sum, item) => sum + item.totalDelivered, 0);
        return { ordered: totalOrdered, delivered: totalDelivered, percentage: totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0 };
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
        if (po.status === 'CLOSED' || progress.percentage === 100) return 'border-green-200';
        if (progress.percentage > 0) return 'border-yellow-200';
        return 'border-blue-200';
    };

    const handleProjectSelect = (id: number) => {
        navigate(`${basePath}/deliveries?projectId=${id}`);
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Track Deliveries</h1>
                    <p className="text-slate-500">Select a project to view delivery status.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="group relative flex flex-col gap-3 rounded-lg border-2 border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Building className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{project.name}</h3>
                                        <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    // Stats calculations
    const totalPOs = purchaseOrders.length;
    const fullyDelivered = purchaseOrders.filter(po => po.status === 'CLOSED' || getDeliveryProgress(po).percentage === 100).length;
    const partiallyDelivered = purchaseOrders.filter(po => {
        const progress = getDeliveryProgress(po);
        return progress.percentage > 0 && progress.percentage < 100 && po.status !== 'CLOSED';
    }).length;
    const awaitingDelivery = purchaseOrders.filter(po => getDeliveryProgress(po).percentage === 0 && po.status !== 'CLOSED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-3">
                        <Truck className="h-7 w-7 text-indigo-600" />
                        Delivery Tracking
                    </h1>
                    {selectedProject && (
                        <p className="text-slate-500 mt-1">{selectedProject.name}</p>
                    )}
                </div>
                {projects.length > 1 && (
                    <button
                        onClick={() => navigate(`${basePath}/deliveries`)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Change Project
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{totalPOs}</p>
                            <p className="text-sm text-slate-500">Total POs</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{fullyDelivered}</p>
                            <p className="text-sm text-green-600">Fully Delivered</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-700">{partiallyDelivered}</p>
                            <p className="text-sm text-yellow-600">Partial</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{awaitingDelivery}</p>
                            <p className="text-sm text-blue-600">Awaiting</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Orders List */}
            {purchaseOrders.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Purchase Orders</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        There are no purchase orders to track for this project yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="font-semibold text-slate-900">Purchase Orders</h2>
                    <div className="grid gap-4">
                        {purchaseOrders.map((po) => {
                            const progress = getDeliveryProgress(po);
                            return (
                                <div
                                    key={po.id}
                                    className={`group rounded-lg border-2 bg-white p-5 transition-all hover:shadow-md ${getDeliveryStatusColor(po)}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                {getDeliveryStatusIcon(po)}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-slate-900">
                                                    PO #{po.poNumber}
                                                </h3>
                                                {po.vendorName && (
                                                    <p className="text-sm text-slate-600">Vendor: {po.vendorName}</p>
                                                )}
                                                <p className="text-sm text-slate-500">
                                                    {po.items.length} items • Created {new Date(po.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-sm font-medium text-slate-700">
                                                {getDeliveryStatusText(po)}
                                            </span>
                                            <span className="text-lg font-bold text-slate-900">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(po.totalValue)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                            <span>{progress.delivered} / {progress.ordered} units delivered</span>
                                            <span>{progress.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${progress.percentage === 100
                                                    ? 'bg-green-500'
                                                    : progress.percentage > 0
                                                        ? 'bg-yellow-500'
                                                        : 'bg-slate-300'
                                                    }`}
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {po.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 rounded px-3 py-2">
                                                    <span className="text-slate-700 truncate">{item.materialDisplayName}</span>
                                                    <span className="text-slate-500 ml-2 flex-shrink-0">
                                                        {item.totalDelivered}/{item.orderedQty}
                                                    </span>
                                                </div>
                                            ))}
                                            {po.items.length > 3 && (
                                                <div className="text-sm text-slate-500 flex items-center px-3 py-2">
                                                    +{po.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>
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

export default ManagerDeliveries;
