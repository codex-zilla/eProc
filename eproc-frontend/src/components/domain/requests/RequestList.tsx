import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../../hooks/queries/useRequests';
import type { RequestDetail } from '../../../types/models';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { DataTable, type ColumnDef } from '@/components/common/DataTable';
import { RequestStatusBadge } from './RequestStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
    AlertCircle,
    Search,
    Filter,
    Briefcase,
    Calendar,
    ChevronDown
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

type SortField = 'date' | 'priority' | 'amount';
type SortOrder = 'asc' | 'desc';

interface RequestListProps {
    role: 'ENGINEER' | 'MANAGER';
}

export const RequestList = ({ role }: RequestListProps) => {
    const navigate = useNavigate();
    const { data: requests = [], isLoading: loading, error: queryError } = useRequests();
    const error = queryError ? 'Failed to load requests' : null;

    // Filters and Search
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Sorting
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Project Grouping State
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    // Initialize expanded projects once requests are loaded
    useEffect(() => {
        if (requests.length > 0 && Object.keys(expandedProjects).length === 0) {
            const projects = new Set(requests.map(r => r.projectName || 'Unassigned'));
            const initialExpanded = Array.from(projects).reduce((acc, project) => ({
                ...acc,
                [project]: true
            }), {});
            setExpandedProjects(initialExpanded);
        }
    }, [requests]);

    const handleRowClick = (request: RequestDetail) => {
        const basePath = role === 'ENGINEER' ? '/engineer/requests' : '/manager/requests';
        navigate(`${basePath}/${request.id}`);
    };

    const toggleProject = (projectName: string) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectName]: !prev[projectName]
        }));
    };

    // Helper to determine priority
    const getPriority = (req: RequestDetail) => req.priority || 'LOW';

    // Helper to get title
    const getTitle = (req: RequestDetail) => req.title || 'BOQ Request';

    // Filter, Search, and Sort Logic
    const processedRequests = useMemo(() => {
        let filtered = requests.filter(request => {
            // Status Filter
            if (statusFilter !== 'ALL' && request.status !== statusFilter) return false;

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const title = getTitle(request).toLowerCase();
                const matchesTitle = title.includes(query);
                const matchesSite = (request.siteName || '').toLowerCase().includes(query);
                const matchesRequester = (request.createdByName || '').toLowerCase().includes(query);
                const matchesProject = (request.projectName || '').toLowerCase().includes(query);

                return matchesTitle || matchesSite || matchesRequester || matchesProject;
            }
            return true;
        });

        // Sorting
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    comparison = dateA - dateB;
                    break;
                case 'amount':
                    comparison = (a.totalValue || 0) - (b.totalValue || 0);
                    break;
                case 'priority':
                    const priorityWeight = { HIGH: 3, LOW: 1, MEDIUM: 2 };
                    const pA = priorityWeight[getPriority(a) as keyof typeof priorityWeight] || 0;
                    const pB = priorityWeight[getPriority(b) as keyof typeof priorityWeight] || 0;
                    comparison = pA - pB;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [requests, statusFilter, searchQuery, sortField, sortOrder]);

    // Group by Project
    const groupedRequests = useMemo(() => {
        const groups: Record<string, RequestDetail[]> = {};
        processedRequests.forEach(req => {
            const project = req.projectName || 'Unassigned Projects';
            if (!groups[project]) groups[project] = [];
            groups[project].push(req);
        });
        return groups;
    }, [processedRequests]);

    // Define columns for DataTable
    const columns: ColumnDef<RequestDetail>[] = [
        {
            header: "Request Name",
            cell: (request) => (
                <span className="text-[#2a3455] text-xs lg:text-sm block pr-2 font-semibold" title={getTitle(request)}>
                    {getTitle(request)}
                </span>
            ),
            className: "pr-0 max-w-[300px]"
        },
        {
            header: "Site",
            accessorKey: "siteName",
            cell: (request) => request.siteName || 'N/A',
            className: "pr-0 text-slate-700 lg:max-w-[120px]"
        },
        {
            header: "Requested By",
            accessorKey: "createdByName",
            cell: (request) => request.createdByName || 'Unknown',
            className: "pr-0 text-slate-700 lg:max-w-[120px]"
        },
        {
            header: "Date",
            cell: (request) => request.plannedStartDate
                ? formatDate(request.plannedStartDate, 'short')
                : formatDate(request.createdAt, 'short'),
            className: "pr-0 text-slate-600 hidden lg:table-cell lg:max-w-[100px]",
            headerClassName: "hidden lg:table-cell"
        },
        {
            header: "Priority",
            cell: (request) => <PriorityBadge priority={getPriority(request)} />,
            className: "pr-0 lg:max-w-[100px]"
        },
        {
            header: "Amount (TZS)",
            cell: (request) => formatCurrency(request.totalValue || 0),
            className: "pr-0 font-bold text-slate-900 font-mono lg:max-w-[130px]"
        },
        {
            header: "Status",
            cell: (request) => <RequestStatusBadge status={request.status} />,
            className: "pr-0"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading requests..." />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search requests, sites, team..."
                            className="pl-10 h-10 bg-white border-slate-200 focus:border-indigo-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                        <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
                            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 focus:border-indigo-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Sort by</span>
                                    <span className="font-medium">{sortField}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                            </SelectContent>
                        </Select>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-10 px-3 border-slate-200 bg-white hover:bg-slate-50 gap-1 flex items-center focus:bg-indigo-50"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        <span className="text-sm font-medium text-slate-600">{sortOrder === 'asc' ? 'asc' : 'desc'}</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform text-slate-500 pt-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{sortOrder === 'asc' ? 'Sort asc' : 'Sort desc'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Status Filters - Pills */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                    {['ALL', 'PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'].map(status => {
                        const count = requests.filter(r => status === 'ALL' ? true : r.status === status).length;
                        const isActive = statusFilter === status;

                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap ${isActive
                                    ? 'bg-[#2a3455] text-white hover:bg-[#1e253e]'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                                {count > 0 && (
                                    <span className={`flex items-center justify-center px-1 sm:px-1.5  h-4 sm:h-5 min-w-[1.25rem] rounded-full text-[10px] ${isActive
                                        ? 'bg-white text-[#2a3455]'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2 flex-1">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="text-xs sm:text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Content */}
            {processedRequests.length === 0 ? (
                <Card className="border-slate-200 shadow-sm border-dashed">
                    <CardContent className="p-0">
                        <EmptyState
                            icon={Filter}
                            title="No requests found"
                            description={statusFilter !== 'ALL'
                                ? "Try adjusting your filters or search query to find what you're looking for."
                                : "No requests have been created yet."}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedRequests).map(([projectName, projectRequests]) => (
                        <div key={projectName} className="space-y-3">
                            {/* Project Header */}
                            <div
                                className="flex items-center gap-2 cursor-pointer group select-none"
                                onClick={() => toggleProject(projectName)}
                            >
                                <div className={`p-1 rounded hover:bg-slate-100 transition-all duration-200 ${!expandedProjects[projectName] ? '-rotate-90' : 'rotate-0'}`}>
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-[#2a3455] flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-[#2a3455]" />
                                    {projectName}
                                    <span className="text-xs font-normal text-slate-500 ml-1">({projectRequests.length} requests)</span>
                                </h3>
                                <div className="h-px flex-1 bg-slate-200 ml-2 group-hover:bg-slate-300 transition-colors" />
                            </div>

                            {/* Project Content */}
                            {expandedProjects[projectName] && (
                                <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block">
                                        <DataTable
                                            data={projectRequests}
                                            columns={columns}
                                            onRowClick={handleRowClick}
                                            keyExtractor={(item) => item.id}
                                        />
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="space-y-3 md:hidden">
                                        {projectRequests.map(request => {
                                            const title = getTitle(request);

                                            return (
                                                <Card
                                                    key={request.id}
                                                    className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                                                    onClick={() => handleRowClick(request)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="grid grid-cols-4 items-start gap-2 mb-3">
                                                            <div className='col-span-3'>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                                                                        {title}
                                                                    </h3>
                                                                    {getPriority(request) === 'HIGH' && (
                                                                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Briefcase className="h-3 w-3" />
                                                                    {request.siteName || 'No Site'}
                                                                </p>
                                                            </div>
                                                            <div className="justify-self-end">
                                                                <RequestStatusBadge status={request.status} />
                                                            </div>

                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {request.plannedStartDate
                                                                    ? formatDate(request.plannedStartDate, 'short')
                                                                    : formatDate(request.createdAt, 'short')}
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-900 font-mono">
                                                                {formatCurrency(request.totalValue || 0)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
