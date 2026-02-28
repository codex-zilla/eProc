import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/queries/useProjects';
import type { Project } from '@/types/models';
import { formatNumber, formatDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type ColumnDef } from '@/components/common/DataTable';
import ProjectStatusBadge from '@/components/domain/ProjectStatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterToolbar } from '@/components/common/FilterToolbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Briefcase, Calendar, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type SortField = 'date' | 'budget' | 'name';
type SortOrder = 'asc' | 'desc';

export const ProjectList = () => {
    const { data: projects = [], isLoading, error, refetch } = useProjects();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const processedProjects = useMemo(() => {
        let filtered = projects.filter((project: Project) => {
            // Status Filter
            if (statusFilter !== 'ALL' && project.status !== statusFilter) return false;

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = (project.name || '').toLowerCase().includes(query);
                const matchesOwner = (project.ownerName || '').toLowerCase().includes(query);
                const matchesCurrency = (project.currency || '').toLowerCase().includes(query);

                return matchesName || matchesOwner || matchesCurrency;
            }
            return true;
        });

        // Sorting
        return filtered.sort((a: Project, b: Project) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    comparison = dateA - dateB;
                    break;
                case 'budget':
                    comparison = (a.budgetTotal || 0) - (b.budgetTotal || 0);
                    break;
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [projects, statusFilter, searchQuery, sortField, sortOrder]);

    const columns: ColumnDef<Project>[] = [
        {
            header: "Project Name",
            cell: (project) => (
                <span className="text-[#2a3455] font-semibold">
                    {project.name}
                </span>
            ),
            className: "min-w-[200px]"
        },
        {
            header: "Owner",
            accessorKey: "ownerName",
            cell: (project) => project.ownerName || 'Not specified',
            className: "text-slate-700 hidden sm:table-cell"
        },
        {
            header: "Budget",
            cell: (project) => (
                <span className="font-mono text-slate-900">
                    {project.currency} {formatNumber(project.budgetTotal || 0)}
                </span>
            ),
            className: "font-medium"
        },
        {
            header: "Created Date",
            cell: (project) => formatDate(project.createdAt, 'short'),
            className: "text-slate-600 hidden md:table-cell"
        },
        {
            header: "Status",
            cell: (project) => <ProjectStatusBadge status={project.status as any} />,
            className: "text-right"
        }
    ];

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

    const statuses = ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

    const searchComponent = (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search projects, owners..."
                    className="w-full"
                />
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
                <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
                    <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 focus:border-indigo-500">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Sort by</span>
                            <span className="font-medium">{sortField === 'date' ? 'Date' : sortField === 'budget' ? 'Budget' : 'Name'}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
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
    );

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <FilterToolbar
                search={searchComponent}
            />

            {/* Status Filters - Pills */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                {statuses.map(status => {
                    const count = projects.filter(p => status === 'ALL' ? true : p.status === status).length;
                    const isActive = statusFilter === status;

                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap ${isActive
                                ? 'bg-[#2a3455] text-white hover:bg-[#1e253e]'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            {status === 'ALL' ? 'All Projects' : status.charAt(0) + status.slice(1).toLowerCase()}
                            {count > 0 && (
                                <span className={`flex items-center justify-center px-1.5 h-5 min-w-[1.25rem] rounded-full text-[10px] ${isActive
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

            {processedProjects.length === 0 ? (
                <Card className="border-slate-200 shadow-sm border-dashed">
                    <CardContent className="p-0">
                        <EmptyState
                            icon={Filter}
                            title="No projects found"
                            description={statusFilter !== 'ALL' || searchQuery
                                ? "Try adjusting your filters or search query to find what you're looking for."
                                : "You have not been assigned to any project yet."}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <DataTable
                            data={processedProjects}
                            columns={columns}
                            keyExtractor={(item) => item.id}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {processedProjects.map(project => (
                            <Card
                                key={project.id}
                                className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900 mb-1">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {project.ownerName || 'No owner specified'}
                                            </p>
                                        </div>
                                        <ProjectStatusBadge status={project.status as any} />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(project.createdAt, 'short')}
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 font-mono">
                                            {project.currency} {formatNumber(project.budgetTotal || 0)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
