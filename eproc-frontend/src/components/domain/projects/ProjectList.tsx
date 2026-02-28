import React from 'react';
import type { Project } from '@/types/models';
import { formatNumber, formatDate } from '@/lib/formatters';
import { getProjectStatusLabel } from '@/lib/status-utils';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type ColumnDef } from '@/components/common/DataTable';
import { MobileListCard } from '@/components/common/MobileListCard';
import { SearchSortToolbar } from '@/components/common/SearchSortToolbar';
import ProjectStatusBadge from '@/components/domain/ProjectStatusBadge';
import { FilterToolbar } from '@/components/common/FilterToolbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { StatusFilterPills } from '@/components/common/StatusFilterPills';
import { Briefcase, Filter } from 'lucide-react';
import {
    useProjectList,
    PROJECT_STATUS_VALUES,
    type SortField,
    type ProjectStatusFilter,
} from '@/hooks/useProjectList';

export interface ProjectListProps {
    onRowClick?: (project: Project) => void;
    emptyStateAction?: React.ReactNode;
    columns?: ColumnDef<Project>[];
}

/**
 * Default column set for the projects table.
 * Exported so individual page files can import and compose their own column lists
 * without introducing conditionals inside ProjectList.
 */
export const defaultProjectColumns: ColumnDef<Project>[] = [
    {
        header: 'Project Name',
        cell: (project) => (
            <span className="text-[#2a3455] font-semibold">{project.name}</span>
        ),
        className: 'min-w-[200px]',
    },
    {
        header: 'Owner',
        accessorKey: 'ownerName',
        cell: (project) => project.ownerName || 'Not specified',
        className: 'text-slate-700 hidden sm:table-cell',
    },
    {
        header: 'Budget',
        cell: (project) => (
            <span className="font-mono text-slate-900">
                {project.currency} {formatNumber(project.budgetTotal || 0)}
            </span>
        ),
        className: 'font-medium',
    },
    {
        header: 'Created Date',
        cell: (project) => formatDate(project.createdAt, 'short'),
        className: 'text-slate-600 hidden md:table-cell',
    },
    {
        header: 'Status',
        cell: (project) => <ProjectStatusBadge status={project.status as any} />,
        className: 'text-right',
    },
];

export const ProjectList = ({ onRowClick, emptyStateAction, columns }: ProjectListProps = {}) => {
    const {
        processedProjects,
        isLoading,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        statusCounts,
        isFiltered,
    } = useProjectList();

    const resolvedColumns = columns ?? defaultProjectColumns;

    // --- Loading / Error early exits ---------------------------------------
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" text="Loading projects..." />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                onRetry={() => refetch()}
                title="Failed to load projects"
            />
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <FilterToolbar
                search={
                    <SearchSortToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search projects..."
                        sortField={filters.sortField}
                        onSortFieldChange={(val) => setFilter('sortField', val as SortField)}
                        sortOrder={filters.sortOrder}
                        onSortOrderChange={(order) => setFilter('sortOrder', order)}
                        sortOptions={[
                            { value: 'date', label: 'Date' },
                            { value: 'name', label: 'Name' },
                            { value: 'budget', label: 'Budget' },
                        ]}
                    />
                }
            />

            {/* Status filter pills */}
            <StatusFilterPills
                items={PROJECT_STATUS_VALUES.map((status) => ({
                    value: status,
                    label: getProjectStatusLabel(status),
                    count: statusCounts[status],
                }))}
                active={filters.status}
                onChange={(v) => setFilter('status', v as ProjectStatusFilter)}
            />

            {/* List / Empty state */}
            {processedProjects.length === 0 ? (
                <Card className="border-slate-200 shadow-sm border-dashed">
                    <CardContent className="p-0">
                        <EmptyState
                            icon={Filter}
                            title="No projects found"
                            description={
                                isFiltered
                                    ? "Try adjusting your filters or search query to find what you're looking for."
                                    : 'You have not been assigned to any project yet.'
                            }
                            action={emptyStateAction}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                    {/* Desktop table */}
                    <div className="hidden md:block">
                        <DataTable
                            data={processedProjects}
                            columns={resolvedColumns}
                            keyExtractor={(item) => item.id}
                            onRowClick={onRowClick}
                        />
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        {processedProjects.map((project) => (
                            <MobileListCard
                                key={project.id}
                                title={project.name}
                                subtitle={project.ownerName || 'No owner specified'}
                                subtitleIcon={<Briefcase className="h-3.5 w-3.5" />}
                                status={<ProjectStatusBadge status={project.status as any} />}
                                date={project.createdAt}
                                amountLabel={`${project.currency} ${formatNumber(project.budgetTotal || 0)}`}
                                onClick={onRowClick ? () => onRowClick(project) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
