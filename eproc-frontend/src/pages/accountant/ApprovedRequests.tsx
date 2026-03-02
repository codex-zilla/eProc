import { useMemo, useState, useCallback } from 'react';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import {
    FileText,
    AlertTriangle,
    Plus
} from 'lucide-react';
import {
    LoadingSpinner,
    EmptyState,
    ErrorDisplay,
    FilterSelect,
    SearchInput,
    type FilterChip,
    PaginationControls,
    PageHeader,
    FilterToolbar,
    getPresetRange,
    DataTable,
    type ColumnDef
} from '../../components/common';
import type { RequestDetail } from '@/types/models';
import { useProjects } from '@/hooks/queries/useProjects';
import { useRequests } from '@/hooks/queries/useRequests';
import { useFilters } from '@/hooks/useFilters';
import { useFilteredRequests } from '@/hooks/useFilteredRequests';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useSites } from '@/hooks/queries/useSites';
import { cn, getAgeInDays } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { ChevronDown, Briefcase } from 'lucide-react';
import { MobileListCard } from '@/components/common';
import { RequestStatusBadge } from '@/components/domain/requests/RequestStatusBadge';

const buildColumns = (): ColumnDef<RequestDetail>[] => [
    {
        header: "Request Name",
        cell: (request: RequestDetail) => (
            <span className="text-[#2a3455] text-xs lg:text-sm block pr-2 font-semibold" title={request.title || 'BOQ Request'}>
                {request.title || 'BOQ Request'}
            </span>
        ),
        className: "pr-0 max-w-[300px]"
    },
    {
        header: "Requested By",
        accessorKey: "createdByName",
        cell: (request: RequestDetail) => (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${request.createdByName}&background=random`} />
                    <AvatarFallback>{request.createdByName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-700">{request.createdByName || 'Unknown'}</span>
            </div>
        ),
        className: "pr-0 text-slate-700 lg:max-w-[150px]"
    },
    {
        header: "Date",
        cell: (request: RequestDetail) => request.plannedStartDate
            ? formatDate(request.plannedStartDate, 'short')
            : formatDate(request.createdAt, 'short'),
        className: "pr-0 text-slate-600 hidden lg:table-cell lg:max-w-[100px]",
        headerClassName: "hidden lg:table-cell"
    },
    {
        id: 'priority',
        header: 'Priority',
        cell: (request: RequestDetail) => (
            <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize",
                request.priority === 'HIGH' ? "bg-red-100 text-red-800" :
                    request.priority === 'MEDIUM' ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
            )}>
                {request.priority?.toLowerCase() || 'low'}
            </span>
        ),
        className: "pr-0 lg:max-w-[100px]"
    },
    {
        header: "Amount (TZS)",
        cell: (request: RequestDetail) => formatCurrency(request.totalValue || 0),
        className: "pr-0 font-bold text-slate-900 font-mono lg:max-w-[130px]"
    },

];

interface RequestFilters {
    status: string;
    project: string | number;
    site: string | number;
    search: string;
    dateRange: { start: string; end: string };
    datePreset: string;
}

const ApprovedRequests = () => {
    const navigateRole = useRoleNavigate();

    const { data: projects = [] } = useProjects();

    const { filters, setFilter } = useFilters<RequestFilters>({
        status: 'APPROVED',
        project: 'ALL',
        site: 'ALL',
        search: '',
        dateRange: getPresetRange('LAST_30'),
        datePreset: 'LAST_30',
    });

    // Fetch Requests with server-side filtering
    const {
        data: requests = [],
        isLoading: isLoadingRequests,
        error: requestsError,
        refetch
    } = useRequests({
        status: 'APPROVED',
        projectId: filters.project === 'ALL' ? undefined : Number(filters.project),
        siteId: filters.site === 'ALL' ? undefined : Number(filters.site),
        excludeOrdered: true
    });

    // Fetch Sites
    const { data: sites = [] } = useSites(
        filters.project === 'ALL' ? undefined : Number(filters.project)
    );

    const debouncedSearch = useDebounce(filters.search, 300);

    // Derived State
    const filteredRequests = useFilteredRequests(requests, debouncedSearch);

    // Pagination
    const pagination = usePagination({
        totalItems: filteredRequests.length,
        initialPageSize: 10
    });

    const paginatedRequests = useMemo(() => {
        return filteredRequests.slice(pagination.startIndex, pagination.endIndex);
    }, [filteredRequests, pagination.startIndex, pagination.endIndex]);

    const stats = useMemo(() => {
        const pendingItems = filteredRequests.length;
        const overdueItems = filteredRequests.filter(r => getAgeInDays(r.createdAt) > 7).length;
        return { pendingItems, overdueItems };
    }, [filteredRequests]);

    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    const toggleProject = (projectName: string) => {
        setExpandedProjects(prev => {
            const isCurrentlyExpanded = prev[projectName] !== false;
            return {
                ...prev,
                [projectName]: !isCurrentlyExpanded
            };
        });
    };

    // Group by Project
    const groupedRequests = useMemo(() => {
        // Helper to group requests by project
        // Note: We are grouping the *paginated* items to respect page size.

        const groups: Record<string, RequestDetail[]> = {};
        paginatedRequests.forEach(req => {
            const project = req.projectName || 'Unassigned Projects';
            if (!groups[project]) groups[project] = [];
            groups[project].push(req);
        });

        // Auto-expand groups on page load if not set
        // (useEffect logic from RequestList adapted for pagination changes)
        // Since paginatedRequests changes on page change, we might want to expand new groups.
        return groups;
    }, [paginatedRequests]);



    const handleAction = useCallback((req: RequestDetail) => {
        // Handle row action (e.g. view details)
        navigateRole(`/procurement/create?requestId=${req.id}&projectId=${req.projectId}`);
    }, [navigateRole]);

    const columns = useMemo(() => buildColumns(), []);

    const resetFilters = useCallback(() => {
        setFilter('project', 'ALL');
        setFilter('site', 'ALL');
        setFilter('search', '');
        setFilter('dateRange', { start: '', end: '' });
        setFilter('datePreset', 'ALL');
        pagination.setPage(1);
    }, [setFilter, pagination]);

    const activeFilterChips = useMemo<FilterChip[]>(() => {
        const chips: FilterChip[] = [];
        if (filters.project !== 'ALL') {
            const project = projects.find(p => p.id === filters.project);
            chips.push({
                id: 'project',
                label: `Project: ${project?.name || 'Unknown'}`,
                onRemove: () => setFilter('project', 'ALL'),
                color: 'indigo'
            });
        }
        if (filters.search) {
            chips.push({
                id: 'search',
                label: `Search: ${filters.search}`,
                onRemove: () => setFilter('search', ''),
                color: 'blue'
            });
        }
        return chips;
    }, [filters, projects, setFilter]);

    if (isLoadingRequests) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading approved requests..." />
            </div>
        );
    }

    if (requestsError) {
        return (
            <ErrorDisplay
                error={requestsError as Error}
                title="Failed to load requests"
                onRetry={refetch}
            />
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Approved Requests"
                description="Review approved material requisitions and generate purchase orders for vendors."
                actions={
                    <Button
                        variant="default"
                        className="text-sm bg-[#2a3455] px-3 sm:px-4 hover:bg-[#1e253e] text-white w-full sm:w-auto whitespace-nowrap"
                        onClick={() => navigateRole('/procurement/create')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Create Purchase Order</span>
                        <span className="sm:hidden">Create PO</span>
                    </Button>
                }
            />

            {(requests.length > 1 || activeFilterChips.length > 0 || filters.search) && (
                <FilterToolbar
                    search={
                        <SearchInput
                            value={filters.search}
                            onChange={(val) => setFilter('search', val)}
                            placeholder="Search project, material or ID..."
                            className="w-full bg-white"
                        />
                    }
                    filters={
                        <>
                            <div className="w-full lg:w-auto lg:min-w-[180px]">
                                <FilterSelect
                                    label="All Projects"
                                    value={filters.project}
                                    onChange={(val) => setFilter('project', val)}
                                    options={[
                                        { value: 'ALL', label: 'All Projects' },
                                        ...projects.map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                />
                            </div>
                            <div className="w-full lg:w-auto lg:min-w-[180px]">
                                <FilterSelect
                                    label="All Sites"
                                    value={filters.site}
                                    onChange={(val) => setFilter('site', val)}
                                    options={[
                                        { value: 'ALL', label: 'All Sites' },
                                        ...sites.map(s => ({ value: s.id, label: s.name }))
                                    ]}
                                />
                            </div>
                        </>
                    }
                    activeFilters={activeFilterChips}
                    onClearAllFilters={resetFilters}
                />
            )}

            {/* Overdue Warning Banner */}
            {stats.overdueItems > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-800">Action Required</h4>
                        <p className="text-xs sm:text-sm text-orange-700 mt-1">
                            {stats.overdueItems} requests have exceeded 7 days pending. Procurement policy requires justification for delays beyond 1 week.
                        </p>
                    </div>
                </div>
            )}

            {/* Content */}
            {filteredRequests.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No approved requests found"
                    description={
                        (activeFilterChips.length > 0 || filters.search)
                            ? "Try adjusting your filters to find what you're looking for."
                            : "There are no approved requests pending procurement."
                    }
                />
            ) : (
                <div className="">
                    <div className="space-y-6">
                        {Object.entries(groupedRequests).map(([projectName, projectRequests]) => (
                            <div key={projectName} className="space-y-3">
                                {/* Project Header */}
                                <div
                                    className="flex items-center gap-2 cursor-pointer group select-none"
                                    onClick={() => toggleProject(projectName)}
                                >
                                    <div className={`p-1 rounded hover:bg-slate-100 transition-all duration-200 ${expandedProjects[projectName] === false ? '-rotate-90' : 'rotate-0'}`}>
                                        <ChevronDown className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <h3 className="text-xs sm:text-base font-bold text-[#2a3455] flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-[#2a3455]" />
                                        {projectName}
                                        <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">({projectRequests.length} requests)</span>
                                    </h3>
                                    <div className="h-px flex-1 bg-slate-200 ml-2 group-hover:bg-slate-300 transition-colors" />
                                </div>

                                {/* Project Content */}
                                {expandedProjects[projectName] !== false && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                                        <div className="hidden md:block">
                                            <DataTable
                                                data={projectRequests}
                                                columns={columns}
                                                keyExtractor={(req) => req.id}
                                                onRowClick={handleAction}
                                                className=""
                                            />
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {projectRequests.map(request => (
                                                <MobileListCard
                                                    key={request.id}
                                                    title={request.title || 'BOQ Request'}
                                                    subtitle={request.siteName}
                                                    status={<RequestStatusBadge status={request.status} />}
                                                    date={request.plannedStartDate || request.createdAt}
                                                    amount={request.totalValue}
                                                    onClick={() => handleAction(request)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <PaginationControls
                            {...pagination}
                            totalFiltered={filteredRequests.length}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovedRequests;
