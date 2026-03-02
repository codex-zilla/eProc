import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { getRequestStatusLabel } from '@/lib/status-utils';
import { Card, CardContent } from '@/components/ui/card';

import { DataTable, type ColumnDef } from '@/components/common/DataTable';
import { MobileListCard } from '@/components/common/MobileListCard';
import { SearchSortToolbar } from '@/components/common/SearchSortToolbar';
import { FilterToolbar } from '@/components/common/FilterToolbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { StatusFilterPills } from '@/components/common/StatusFilterPills';
import { RequestStatusBadge } from './RequestStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Briefcase, ChevronDown, Filter } from 'lucide-react';
import {
    useRequestList,
    REQUEST_STATUS_VALUES,
    type RequestSortField,
    type RequestStatusFilter,
} from '@/hooks/useRequestList';
import type { RequestDetail } from '@/types/models';

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const getTitle = (req: RequestDetail) => req.title || 'BOQ Request';
const getPriority = (req: RequestDetail) => req.priority || 'LOW';

const requestColumns: ColumnDef<RequestDetail>[] = [
    {
        header: 'Request Name',
        cell: (req) => (
            <span className="text-[#2a3455] text-xs lg:text-sm block pr-2 font-semibold" title={getTitle(req)}>
                {getTitle(req)}
            </span>
        ),
        className: 'pr-0 max-w-[300px]',
    },
    {
        header: 'Site',
        accessorKey: 'siteName',
        cell: (req) => req.siteName || 'N/A',
        className: 'pr-0 text-slate-700 lg:max-w-[120px]',
    },
    {
        header: 'Requested By',
        accessorKey: 'createdByName',
        cell: (req) => req.createdByName || 'Unknown',
        className: 'pr-0 text-slate-700 lg:max-w-[120px]',
    },
    {
        header: 'Date',
        cell: (req) =>
            req.plannedStartDate
                ? formatDate(req.plannedStartDate, 'short')
                : formatDate(req.createdAt, 'short'),
        className: 'pr-0 text-slate-600 hidden lg:table-cell lg:max-w-[100px]',
        headerClassName: 'hidden lg:table-cell',
    },
    {
        header: 'Priority',
        cell: (req) => <PriorityBadge priority={getPriority(req)} />,
        className: 'pr-0 lg:max-w-[100px]',
    },
    {
        header: 'Amount (TZS)',
        cell: (req) => formatCurrency(req.totalValue || 0),
        className: 'pr-0 font-bold text-slate-900 font-mono lg:max-w-[130px]',
    },
    {
        header: 'Status',
        cell: (req) => <RequestStatusBadge status={req.status} />,
        className: 'pr-0',
    },
];

export interface RequestListProps {
    onRowClick?: (request: RequestDetail) => void;
    emptyStateAction?: React.ReactNode;
}

export const RequestList = ({ emptyStateAction }: RequestListProps = {}) => {
    const navigateRole = useRoleNavigate();

    const {
        processedRequests,
        groupedRequests,
        expandedProjects,
        toggleProject,
        isLoading,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        statusCounts,
        isFiltered,
    } = useRequestList();

    const handleRowClick = (request: RequestDetail) => {
        navigateRole(`/requests/${request.id}`);
    };

    // --- Loading / Error early exits -----------------------------------------
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading requests..." />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                onRetry={() => refetch()}
                title="Failed to load requests"
            />
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-500">
            <FilterToolbar
                search={
                    <SearchSortToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search requests, sites, team..."
                        sortField={filters.sortField}
                        onSortFieldChange={(val) => setFilter('sortField', val as RequestSortField)}
                        sortOrder={filters.sortOrder}
                        onSortOrderChange={(order) => setFilter('sortOrder', order)}
                        sortOptions={[
                            { value: 'date', label: 'Date' },
                            { value: 'priority', label: 'Priority' },
                            { value: 'amount', label: 'Amount' },
                        ]}
                    />
                }
            />

            {/* Status filter pills */}
            <StatusFilterPills
                items={REQUEST_STATUS_VALUES.map((status) => ({
                    value: status,
                    label: status === 'ALL' ? 'All Requests' : getRequestStatusLabel(status as Exclude<RequestStatusFilter, 'ALL'>),
                    count: statusCounts[status],
                }))}
                active={filters.status}
                onChange={(v) => setFilter('status', v as RequestStatusFilter)}
            />

            {/* Content */}
            {processedRequests.length === 0 ? (
                <Card className="border-slate-200 shadow-sm border-dashed">
                    <CardContent className="p-0">
                        <EmptyState
                            icon={Filter}
                            title="No requests found"
                            description={
                                isFiltered
                                    ? "Try adjusting your filters or search query to find what you're looking for."
                                    : 'No requests have been created yet.'
                            }
                            action={emptyStateAction}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedRequests).map(([projectName, projectRequests]) => (
                        <div key={projectName} className="space-y-3">
                            {/* Project group header */}
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
                                    <span className="text-xs font-normal text-slate-500 ml-1">
                                        ({projectRequests.length} requests)
                                    </span>
                                </h3>
                                <div className="h-px flex-1 bg-slate-200 ml-2 group-hover:bg-slate-300 transition-colors" />
                            </div>

                            {/* Project group content */}
                            {expandedProjects[projectName] && (
                                <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                                    {/* Desktop table */}
                                    <div className="hidden md:block">
                                        <DataTable
                                            data={projectRequests}
                                            columns={requestColumns}
                                            onRowClick={handleRowClick}
                                            keyExtractor={(item) => item.id}
                                        />
                                    </div>

                                    {/* Mobile cards */}
                                    <div className="space-y-3 md:hidden">
                                        {projectRequests.map((request) => (
                                            <MobileListCard
                                                key={request.id}
                                                title={getTitle(request)}
                                                titleAdornment={
                                                    getPriority(request) === 'HIGH' ? (
                                                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                                                    ) : undefined
                                                }
                                                subtitle={request.siteName || 'No Site'}
                                                subtitleIcon={<Briefcase className="h-3 w-3" />}
                                                status={<RequestStatusBadge status={request.status} />}
                                                date={request.plannedStartDate ?? request.createdAt}
                                                amount={request.totalValue || 0}
                                                onClick={() => handleRowClick(request)}
                                            />
                                        ))}
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
