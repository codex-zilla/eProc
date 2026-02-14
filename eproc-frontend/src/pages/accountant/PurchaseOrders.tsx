import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Calendar,
    Hourglass,
    Truck,
    DollarSign,
    Filter,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatCurrency } from '../../lib/formatters';
import { FilterSelect, DateRangePicker, type DatePreset, getPresetRange, PRESET_LABELS } from '../../components/common';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { PurchaseOrderResponse } from '../../services/procurementService';
import { getProjectPurchaseOrders } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/models';





// ══════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════
const PurchaseOrders = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getPresetRange('LAST_30'));
    const [datePreset, setDatePreset] = useState<DatePreset>('LAST_30');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const projectsData = await projectService.getAllProjects();
            setProjects(projectsData);

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
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        let filtered = [...purchaseOrders];

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(po => po.status === statusFilter);
        }
        if (projectFilter !== 'ALL') {
            filtered = filtered.filter(po => po.projectId === projectFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(query) ||
                po.projectName.toLowerCase().includes(query) ||
                (po.siteName || '').toLowerCase().includes(query) ||
                po.createdByName.toLowerCase().includes(query)
            );
        }
        if (dateRange.start) {
            filtered = filtered.filter(po => new Date(po.createdAt) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            const endOfDay = new Date(dateRange.end);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter(po => new Date(po.createdAt) <= endOfDay);
        }

        return filtered;
    }, [purchaseOrders, statusFilter, projectFilter, searchQuery, dateRange]);

    // Status card stats
    const stats = useMemo(() => {
        const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);
        const openCount = purchaseOrders.filter(po => po.status === 'OPEN').length;
        const closedCount = purchaseOrders.filter(po => po.status === 'CLOSED').length;
        const openValue = purchaseOrders.filter(po => po.status === 'OPEN').reduce((sum, po) => sum + po.totalValue, 0);
        return { total: purchaseOrders.length, totalValue, open: openCount, closed: closedCount, openValue };
    }, [purchaseOrders]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                    <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading purchase orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-5 animate-in fade-in duration-500">
            {/* Status Summary Cards */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:pb-0 -mx-4 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                {[
                    { label: 'Total Active POs', value: stats.total, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', labelColor: 'text-[#2a3455]', valueColor: 'text-[#2a3455]' },
                    { label: 'Pending Approval', value: stats.open, icon: Hourglass, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', labelColor: 'text-amber-600', valueColor: 'text-amber-900' },
                    { label: 'Delivered This Month', value: stats.closed, icon: Truck, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', labelColor: 'text-green-600', valueColor: 'text-green-900' },
                    { label: 'Total Spend (YTD)', value: formatCurrency(stats.totalValue, true), icon: DollarSign, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', labelColor: 'text-slate-600', valueColor: 'text-slate-900' },
                ].map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-xl border ${stat.borderColor} p-2 sm:p-3 shadow-sm flex justify-between relative overflow-hidden min-w-[140px] sm:min-w-0`}>
                        <div className="relative z-10">
                            <p className={`text-[10px] sm:text-xs font-medium ${stat.labelColor} uppercase tracking-wider`}>{stat.label}</p>
                            <h3 className={`text-lg sm:text-2xl font-bold ${stat.valueColor} mt-1 sm:mt-2`}>{stat.value}</h3>
                        </div>
                        <div className={`absolute -right-2 -bottom-1.5 p-2 opacity-10 sm:self-start sm:opacity-100 sm:relative sm:right-auto sm:bottom-auto sm:self-end sm:p-2 sm:rounded-lg sm:bg-white sm:bg-opacity-60 transition-all`}>
                            <stat.icon className={`h-9 w-9 sm:h-5 sm:w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="space-y-2">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">

                    <div className="flex items-center gap-2 w-full lg:w-auto flex-grow lg:flex-1">
                        {/* Search - Grow to fill space */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search PO #, Project..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 h-10 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                        </div>

                        {/* Mobile Filter Toggle - Inline with search */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex-none h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Desktop Filters / Mobile Collapsible */}
                    <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto`}>
                        {/* Project */}
                        <div className="min-w-[200px]">
                            <FilterSelect
                                label="All Projects"
                                value={projectFilter}
                                onChange={(val) => setProjectFilter(val)}
                                options={[
                                    { value: 'ALL', label: 'All Projects' },
                                    ...projects.map(p => ({ value: p.id, label: p.name }))
                                ]}
                            />
                        </div>

                        {/* Status */}
                        <div className="min-w-[140px]">
                            <FilterSelect<'ALL' | 'OPEN' | 'CLOSED'>
                                label="All Statuses"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'ALL', label: 'All Statuses' },
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'CLOSED', label: 'Closed' }
                                ]}
                                icon={Hourglass}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <div className="min-w-[240px]">
                            <DateRangePicker
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                datePreset={datePreset}
                                setDatePreset={setDatePreset}
                                formatDisplayDate={(d) => formatDate(d, 'short')}
                            />
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary (Chips) */}
                {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || datePreset !== 'ALL') && (
                    <div className="flex flex-wrap items-center gap-2 px-1 border-t border-slate-100">
                        {statusFilter !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                <span>Status: {statusFilter === 'OPEN' ? 'Open' : 'Closed'}</span>
                                <button onClick={() => setStatusFilter('ALL')} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {projectFilter !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                                <span>Project: {projects.find(p => p.id === projectFilter)?.name}</span>
                                <button onClick={() => setProjectFilter('ALL')} className="hover:text-indigo-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        {datePreset !== 'ALL' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                <span>Date: {PRESET_LABELS[datePreset] || 'Custom'}</span>
                                <button onClick={() => { setDatePreset('ALL'); setDateRange({ start: '', end: '' }); }} className="hover:text-slate-900"><X className="h-3 w-3" /></button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setStatusFilter('ALL');
                                setProjectFilter('ALL');
                                setSearchQuery('');
                                setDateRange({ start: '', end: '' });
                                setDatePreset('ALL');
                            }}
                            className="text-xs text-slate-500 hover:text-red-600 font-medium ml-1 underline decoration-dotted hover:decoration-solid underline-offset-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {filteredOrders.length === 0 ? (
                <Card className="border-slate-200 shadow-none border-dashed bg-stone--100">
                    <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No purchase orders found</h3>
                        {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || searchQuery) && (
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                Try adjusting your filters to find what you're looking for.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table */}
                    <Card className="border-slate-200 shadow-none hidden md:block overflow-hidden rounded-lg border">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#2a3455]">
                                    <TableRow className="hover:bg-[#2a3455] border-b-0">
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">PO Number</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Project</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Created Date</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Total Value (TZS)</TableHead>
                                        <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(po => (
                                        <TableRow
                                            key={po.id}
                                            onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                                            className="hover:bg-indigo-50/50 cursor-pointer transition-colors group border-slate-100"
                                        >
                                            <TableCell className="p-2 pr-0">
                                                <span className="font-semibold text-[#2a3455] text-xs lg:text-sm">{po.poNumber}</span>
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-700">
                                                {po.projectName}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-700">
                                                {formatDate(po.createdAt)}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-xs lg:text-sm font-bold text-slate-900 font-mono">
                                                {formatCurrency(po.totalValue)}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0">
                                                <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {filteredOrders.map(po => (
                            <Card
                                key={po.id}
                                className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                                onClick={() => navigate(`/accountant/purchase-orders/${po.id}`)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-sm text-[#2a3455] line-clamp-1">{po.poNumber}</h3>
                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{po.projectName}</p>
                                        </div>
                                        <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(po.createdAt)}
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 font-mono">{formatCurrency(po.totalValue)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrders;
