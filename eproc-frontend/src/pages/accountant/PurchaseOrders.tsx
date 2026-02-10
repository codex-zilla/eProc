import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Filter,
    Download,
    Copy,
    Loader2,
    ChevronDown,
    ExternalLink,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import type { PurchaseOrderResponse } from '../../services/procurementService';
import { getProjectPurchaseOrders } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/models';

const PurchaseOrders = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderResponse[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [statusFilter, projectFilter, searchQuery, dateRange, purchaseOrders]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch projects
            const projectsData = await projectService.getAllProjects();
            setProjects(projectsData);

            // Fetch all purchase orders
            // TODO: This should be replaced with a getAllPurchaseOrders() endpoint
            // For now, fetch POs from all projects
            const allPOs: PurchaseOrderResponse[] = [];
            for (const project of projectsData) {
                try {
                    const pos = await getProjectPurchaseOrders(project.id);
                    allPOs.push(...pos);
                } catch (error) {
                    console.error(`Failed to fetch POs for project ${project.id}:`, error);
                }
            }

            setPurchaseOrders(allPOs);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load purchase orders');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...purchaseOrders];

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(po => po.status === statusFilter);
        }

        // Project filter
        if (projectFilter !== 'ALL') {
            filtered = filtered.filter(po => po.projectId === projectFilter);
        }

        // Search filter (PO number or project name)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(query) ||
                po.projectName.toLowerCase().includes(query) ||
                po.createdByName.toLowerCase().includes(query)
            );
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(po => new Date(po.createdAt) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            filtered = filtered.filter(po => new Date(po.createdAt) <= new Date(dateRange.end));
        }

        setFilteredOrders(filtered);
    };

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

    const handleCopySummary = (po: PurchaseOrderResponse) => {
        const summary = `Purchase Order: ${po.poNumber}\nProject: ${po.projectName}\nTotal Value: ${formatCurrency(po.totalValue)}\nCreated: ${formatDate(po.createdAt)}\nCreated By: ${po.createdByName}`;
        navigator.clipboard.writeText(summary);
        toast.success('Summary copied to clipboard');
    };

    const handleDownloadSummary = (po: PurchaseOrderResponse) => {
        // TODO: Implement PDF/CSV download
        toast.info('Download functionality coming soon');
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
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and review all purchase orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search PO number, project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full pl-10 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:border-transparent"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Project Filter */}
                    <div className="relative">
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            className="w-full px-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:border-transparent"
                        >
                            <option value="ALL">All Projects</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date Range */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || searchQuery || dateRange.start) && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">Showing {filteredOrders.length} of {purchaseOrders.length} orders</span>
                            <button
                                onClick={() => {
                                    setStatusFilter('ALL');
                                    setProjectFilter('ALL');
                                    setSearchQuery('');
                                    setDateRange({ start: '', end: '' });
                                }}
                                className="text-[#2a3455] hover:text-[#1e253e] font-medium ml-2"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Purchase Orders Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created By</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Value</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((po) => (
                                    <tr
                                        key={po.id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-[#2a3455]">{po.poNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{po.projectName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600">{po.createdByName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600">{formatDate(po.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(po.totalValue)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${po.status === 'OPEN'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleCopySummary(po)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Copy Summary"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadSummary(po)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Download Summary"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                                    className="p-1.5 text-[#2a3455] hover:bg-[#2a3455]/10 rounded transition-colors"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 text-sm">No purchase orders found</p>
                                        {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || searchQuery) && (
                                            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-200">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((po) => (
                            <div
                                key={po.id}
                                onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2a3455]">{po.poNumber}</p>
                                        <p className="text-xs text-slate-600 mt-1">{po.projectName}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${po.status === 'OPEN'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {po.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                    <div className="text-xs text-slate-500">
                                        <p>{po.createdByName}</p>
                                        <p className="mt-1">{formatDate(po.createdAt)}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(po.totalValue)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm">No purchase orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrders;
