import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject, useUpdateProjectStatus } from '@/hooks/queries/useProjects';
import { useSites } from '@/hooks/queries/useSites';
import { toast } from 'sonner';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Briefcase, FileText, Layers, Flag } from 'lucide-react';
import TeamManagement from '@/components/TeamManagement';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import ProjectStatusBadge from '@/components/domain/ProjectStatusBadge';

// Domain components
import { ProjectQuickStats } from '@/components/domain/projects/ProjectQuickStats';
import { ProjectOverviewTab } from '@/components/domain/projects/ProjectOverviewTab';
import { ProjectSitesTab } from '@/components/domain/projects/ProjectSitesTab';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : 0;

    const [activeTab, setActiveTab] = useState('overview');

    const { data: project, isLoading: loadingProject, error: projectError, refetch } = useProject(projectId);
    const { data: sites = [] } = useSites(projectId);

    const updateStatusMutation = useUpdateProjectStatus();

    const handleUpdateStatus = (newStatus: string) => {
        if (!project) return;

        updateStatusMutation.mutate(
            { id: project.id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(`Project marked as ${newStatus}`);
                },
                onError: (err: any) => {
                    toast.error(err?.message || `Failed to mark project as ${newStatus}`);
                }
            }
        );
    };

    if (loadingProject) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner size="lg" text="Loading project details..." />
        </div>
    );

    if (projectError) return (
        <ErrorDisplay
            error={projectError}
            onRetry={() => refetch()}
            title="Failed to load project details"
        />
    );

    if (!project) return <div className="text-center py-6 sm:py-8 text-red-500 text-sm sm:text-base">Project not found</div>;

    return (
        <div className="space-y-3 sm:space-y-6 max-w-7xl mx-auto pb-6 sm:pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
                {/* Left: Title & metadata */}
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a3455] truncate mb-2 sm:mb-2.5">
                        {project.name}
                    </h1>
                    <div className="flex lg:flex-row items-center justify-start gap-2 sm:gap-4 text-slate-500">
                        <div className="flex order-2 lg:order-1 items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-gray-500 bg-white hidden lg:inline-flex">{project.code || 'NO-CODE'}</Badge>
                            <ProjectStatusBadge status={project.status} />
                        </div>

                        <div className="flex order-1 lg:order-2 items-center gap-2 min-w-0">
                            <span className="hidden lg:inline text-gray-300">•</span>
                            <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                                <span className="truncate text-[10px] sm:text-xs font-medium">
                                    {project.industry} • {project.projectType}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                {project.status === 'ACTIVE' && (
                    <div className="flex w-full sm:w-auto items-center shrink-0 gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus('COMPLETED')}
                            disabled={updateStatusMutation.isPending}
                            className="bg-[#2a3455] hover:bg-[#1e256e] text-xs sm:text-sm h-9 flex-1 sm:flex-none"
                        >
                            <CheckCircle className="mr-1.5 sm:mr-2 h-4 w-4" />
                            <span className="hidden xs:inline">Mark </span>Completed
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus('CANCELLED')}
                            disabled={updateStatusMutation.isPending}
                            className="text-xs sm:text-sm h-9 flex-1 sm:flex-none border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-none"
                        >
                            <XCircle className="mr-1.5 sm:mr-2 h-4 w-4" /> Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Quick Stats Bar */}
            <div className="hidden lg:block">
                <ProjectQuickStats project={project} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1 sm:gap-4 lg:gap-6 overflow-x-auto flex-nowrap">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
                    <TabsTrigger value="sites" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Sites</TabsTrigger>
                    <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Team</TabsTrigger>
                    <TabsTrigger value="milestones" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Milestones</TabsTrigger>
                    <TabsTrigger value="scopes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Scopes</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Documents</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <ProjectOverviewTab project={project} onManageTeamClick={() => setActiveTab('team')} />
                </TabsContent>

                {/* SITES TAB */}
                <TabsContent value="sites" className="mt-4 sm:mt-6">
                    <ProjectSitesTab project={project} sites={sites} />
                </TabsContent>

                {/* TEAM TAB */}
                <TabsContent value="team" className="mt-4 sm:mt-6">
                    <TeamManagement projectId={project.id} projectOwnerId={project.ownerId} />
                </TabsContent>

                {/* MILESTONES TAB */}
                <TabsContent value="milestones" className="mt-4 sm:mt-6">
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 p-8 sm:p-14 text-center">
                        <Flag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Milestones</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Milestone tracking coming soon. Use this tab to track Approval Requests and Deadlines.</p>
                    </div>
                </TabsContent>

                {/* SCOPES TAB */}
                <TabsContent value="scopes" className="mt-4 sm:mt-6">
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 p-8 sm:p-14 text-center">
                        <Layers className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Scopes</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Scope definition viewer coming soon. Scopes will be defined by the Lead Engineer.</p>
                    </div>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-4 sm:mt-6">
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 p-8 sm:p-14 text-center">
                        <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Documents</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Document repository coming soon.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
};

export default ProjectDetails;
