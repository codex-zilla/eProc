import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Plus, Building, ArrowRight, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../lib/formatters';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { DataTable, type ColumnDef } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProjects } from '@/hooks/queries/useProjects';
import { usePurchaseOrders } from '@/hooks/queries/usePurchaseOrders';
import type { PurchaseOrder } from '@/types/models';

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
    const error = projectsError || posError;

    // Auto-redirect if only one project
    useEffect(() => {
        if (!projectId && !projectsLoading && projects.length === 1) {
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

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                title="Failed to load procurement data"
            />
        );
    }

    // Project selection screen
    if (!projectId) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <PageHeader
                    title={
                        <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-[#2a3455]" />
                            Select Project
                        </div>
                    }
                    description="Choose a project to manage procurement."
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="group relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#2a3455] hover:shadow-md cursor-pointer text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div className="rounded-full bg-[#2a3455]/10 p-2.5 text-[#2a3455] group-hover:bg-[#2a3455] group-hover:text-white transition-colors">
                                    <Building className="h-5 w-5" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[#2a3455] transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-1">
                                    {project.siteLocation || project.region || 'No location'}
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${project.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Stats
    const totalPOs = purchaseOrders.length;
    const openPOs = purchaseOrders.filter(po => po.status === 'OPEN').length;
    const closedPOs = purchaseOrders.filter(po => po.status === 'CLOSED').length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);

    const poColumns: ColumnDef<PurchaseOrder>[] = [
        {
            header: 'PO Number',
            cell: (po) => <span className="font-semibold text-[#2a3455] text-xs sm:text-sm">{po.poNumber}</span>,
            className: 'pr-0 text-xs sm:text-sm',
        },
        {
            header: 'Vendor',
            accessorKey: 'vendorName',
            className: 'text-slate-600 text-xs sm:text-sm',
        },
        {
            header: 'Date',
            cell: (po) => <span className="text-slate-500 whitespace-nowrap text-xs sm:text-sm">{formatDate(po.createdAt)}</span>,
            className: 'hidden md:table-cell text-xs sm:text-sm',
            headerClassName: 'hidden md:table-cell',
        },
        {
            header: 'Status',
            cell: (po) => <StatusBadge status={po.status} type="po" className="text-[10px] sm:text-xs" />,
            className: 'text-xs sm:text-sm',
        },
        {
            header: 'Amount (TZS)',
            cell: (po) => <span className="font-bold text-slate-800 text-xs sm:text-sm font-mono">{formatCurrency(po.totalValue)}</span>,
            className: 'text-right text-xs sm:text-sm',
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#2a3455]" />
                        Procurement Dashboard
                    </div>
                }
                description="Manage purchase orders and active procurements."
                actions={
                    <Button
                        onClick={() => navigate(`${basePath}/procurement/create?projectId=${projectId}`)}
                        className="bg-[#2a3455] hover:bg-[#1e253e] text-white h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Create Purchase Order</span>
                        <span className="sm:hidden">Create PO</span>
                    </Button>
                }
            />

            {/* Stats Overview */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Orders" value={totalPOs} icon={ShoppingCart} color="blue" />
                <StatCard label="Open Orders" value={openPOs} icon={Clock} color="purple" />
                <StatCard label="Completed" value={closedPOs} icon={CheckCircle} color="green" />
                <StatCard
                    label="Total Value"
                    value={formatCurrency(totalValue)}
                    icon={DollarSign}
                    color="amber"
                />
            </div>

            {/* Orders Table */}
            {purchaseOrders.length > 0 ? (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2 text-[#2a3455]" />
                            Recent Purchase Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            data={purchaseOrders}
                            columns={poColumns}
                            keyExtractor={(po) => po.id.toString()}
                            onRowClick={(po) =>
                                navigate(`${basePath}/procurement/purchase-orders/${po.id}?projectId=${projectId}`)
                            }
                            emptyMessage="No purchase orders found"
                            headerClassName="bg-slate-50 text-slate-500 font-medium border-b border-slate-100"
                        />
                    </CardContent>
                </Card>
            ) : (
                <EmptyState
                    icon={ShoppingCart}
                    title="No Orders Found"
                    description="No purchase orders have been created for this project yet."
                    action={{
                        label: 'Create First Order',
                        onClick: () => navigate(`${basePath}/procurement/create?projectId=${projectId}`),
                    }}
                />
            )}
        </div>
    );
};

export default ProcurementDashboard;
