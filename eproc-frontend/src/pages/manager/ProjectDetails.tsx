
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/models';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, MapPin, FileText, CheckCircle, XCircle, Briefcase, Layers, Flag } from 'lucide-react';
import TeamManagement from '@/components/TeamManagement';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load Data
    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            const data = await projectService.getProjectById(parseInt(id));
            setProject(data);
        } catch (err) {
            console.error('Failed to load project:', err);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!project) return;
        setError(null);
        try {
            await projectService.updateProjectStatus(project.id, newStatus);
            setSuccess(`Project marked as ${newStatus}`);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <div className="text-center py-6 sm:py-8 text-sm sm:text-base">Loading project...</div>;
    if (!project) return <div className="text-center py-6 sm:py-8 text-red-500 text-sm sm:text-base">Project not found</div>;

    const statusColorClass = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500';
            case 'COMPLETED': return 'bg-blue-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    // Calculate progress based on milestones (mock for now, or use project count fields)


    return (
        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6 sm:pb-10">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div>
                         <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-gray-500 text-[10px] sm:text-xs">{project.code || 'NO-CODE'}</Badge>
                            <Badge className={`${statusColorClass(project.status)} text-[10px] sm:text-xs`}>{project.status}</Badge>
                         </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
                        <p className="text-gray-500 flex items-center gap-1.5 sm:gap-2 mt-1 text-xs sm:text-sm">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {project.industry} • {project.projectType}
                        </p>
                    </div>
                     {project.status === 'ACTIVE' && (
                        <div className="flex flex-wrap gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleUpdateStatus('COMPLETED')} 
                             className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm h-8 sm:h-9"
                           >
                             <CheckCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                             <span className="hidden xs:inline">Mark </span>Completed
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleUpdateStatus('CANCELLED')} 
                             className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
                           >
                             <XCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Cancel
                           </Button>
                        </div>
                     )}
                </div>

                {/* Quick Stats Bar */}
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-500 hidden sm:inline">Owner Rep:</span>
                                <span className="font-medium truncate">{project.ownerRepName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-500 hidden sm:inline">Location:</span>
                                <span className="font-medium truncate">{project.region}, {project.district}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-500 hidden sm:inline">Due:</span>
                                <span className="font-medium">{project.expectedCompletionDate || 'TBD'}</span>
                            </div>
                             <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-gray-500 hidden sm:inline">Budget:</span>
                                <span className="font-medium text-green-700">{project.currency} {project.budgetTotal?.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-2 sm:p-3 rounded text-xs sm:text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-2 sm:p-3 rounded text-xs sm:text-sm">{success}</div>}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1 sm:gap-4 lg:gap-6 overflow-x-auto flex-nowrap">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
                    <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Team</TabsTrigger>
                    <TabsTrigger value="milestones" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Milestones</TabsTrigger>
                    <TabsTrigger value="scopes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Scopes</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">Documents</TabsTrigger>
                </TabsList>
                
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <Card>
                                <CardHeader className="p-3 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Context & Objectives</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                                    <div>
                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">Key Objectives</h4>
                                        <p className="text-gray-600 text-xs sm:text-sm whitespace-pre-wrap">{project.keyObjectives || 'No objectives defined.'}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">Expected Output</h4>
                                        <p className="text-gray-600 text-xs sm:text-sm whitespace-pre-wrap">{project.expectedOutput || 'No output defined.'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-3 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Site Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm p-3 sm:p-6 pt-0">
                                    <div><span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">Region</span><span className="font-medium">{project.region}</span></div>
                                    <div><span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">District</span><span className="font-medium">{project.district}</span></div>
                                    <div><span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">Ward</span><span className="font-medium">{project.ward}</span></div>
                                    <div><span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">Plot Number</span><span className="font-medium">{project.plotNumber || 'N/A'}</span></div>
                                    <div className="col-span-2 mt-1 sm:mt-2">
                                        <span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">Access Notes</span>
                                        <p className="text-gray-700 font-medium">{project.siteAccessNotes || 'None'}</p>
                                    </div>
                                     <div className="col-span-2 mt-1 sm:mt-2">
                                        <span className="text-gray-500 block text-[10px] sm:text-xs uppercase tracking-wide">GPS</span>
                                        <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">{project.gpsCoordinates || 'Not pinned'}</code>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <Card>
                                <CardHeader className="p-3 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Contract</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-3 sm:p-6 pt-0">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Type</span>
                                        <span className="font-medium">{project.contractType || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Defects Period</span>
                                        <span className="font-medium">{project.defectsLiabilityPeriod || 0} Months</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Start Date</span>
                                        <span className="font-medium">{project.startDate || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Completion</span>
                                        <span className="font-medium">{project.expectedCompletionDate || 'N/A'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader className="p-3 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Team Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-6 pt-0">
                                    <div className="text-center py-3 sm:py-4">
                                        <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{project.teamCount || 0}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">Assigned Members</p>
                                        <Button variant="link" className="text-xs sm:text-sm h-auto p-0 mt-2" onClick={() => document.getElementById('tab-team')?.click()}>Manage Team</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TEAM TAB */}
                <TabsContent value="team" className="mt-4 sm:mt-6">
                    <TeamManagement projectId={project.id} projectOwnerId={project.ownerId} />
                </TabsContent>

                {/* MILESTONES TAB */}
                <TabsContent value="milestones" className="mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="p-3 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Project Milestones</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Track key deliverables and deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-center py-6 sm:py-10 text-gray-500">
                                <Flag className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-300" />
                                <p className="text-sm sm:text-base">Milestone tracking coming soon.</p>
                                <p className="text-xs sm:text-sm">Use this tab to track Approval Requests and Deadlines.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SCOPES TAB */}
                <TabsContent value="scopes" className="mt-4 sm:mt-6">
                    <Card>
                         <CardHeader className="p-3 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Project Scopes</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Defined work categories for this project.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-center py-6 sm:py-10 text-gray-500">
                                <Layers className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-300" />
                                <p className="text-sm sm:text-base">Scope definition viewer coming soon.</p>
                                <p className="text-xs sm:text-sm">Scopes will be defined by the Lead Engineer.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="p-3 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Project Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-center py-6 sm:py-10 text-gray-500">
                                <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-gray-300" />
                                <p className="text-sm sm:text-base">Document repository coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProjectDetails;
