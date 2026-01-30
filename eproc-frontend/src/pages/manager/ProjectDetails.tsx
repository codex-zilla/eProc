
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

    if (loading) return <div className="text-center py-8">Loading project...</div>;
    if (!project) return <div className="text-center py-8 text-red-500">Project not found</div>;

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
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                         <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="text-gray-500">{project.code || 'NO-CODE'}</Badge>
                            <Badge className={statusColorClass(project.status)}>{project.status}</Badge>
                         </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Briefcase className="w-4 h-4" /> {project.industry} • {project.projectType}
                        </p>
                    </div>
                     {project.status === 'ACTIVE' && (
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('COMPLETED')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                             <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                           </Button>
                           <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('CANCELLED')} className="text-red-600 border-red-200 hover:bg-red-50">
                             <XCircle className="mr-2 h-4 w-4" /> Cancel
                           </Button>
                        </div>
                     )}
                </div>

                {/* Quick Stats Bar */}
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="py-4 flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">Owner Rep:</span>
                            <span className="font-medium">{project.ownerRepName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">Location:</span>
                            <span className="font-medium">{project.region}, {project.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">Due:</span>
                            <span className="font-medium">{project.expectedCompletionDate || 'TBD'}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="text-gray-500">Budget:</span>
                            <span className="font-medium text-green-700">{project.currency} {project.budgetTotal?.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded">{success}</div>}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3">Overview</TabsTrigger>
                    <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3">Team</TabsTrigger>
                    <TabsTrigger value="milestones" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3">Milestones</TabsTrigger>
                    <TabsTrigger value="scopes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3">Scopes</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-3">Documents</TabsTrigger>
                </TabsList>
                
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Context & Objectives</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-1">Key Objectives</h4>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{project.keyObjectives || 'No objectives defined.'}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-1">Expected Output</h4>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{project.expectedOutput || 'No output defined.'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Site Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-500 block">Region</span>{project.region}</div>
                                    <div><span className="text-gray-500 block">District</span>{project.district}</div>
                                    <div><span className="text-gray-500 block">Ward</span>{project.ward}</div>
                                    <div><span className="text-gray-500 block">Plot Number</span>{project.plotNumber || 'N/A'}</div>
                                    <div className="col-span-2 mt-2">
                                        <span className="text-gray-500 block">Access Notes</span>
                                        <p className="text-gray-700">{project.siteAccessNotes || 'None'}</p>
                                    </div>
                                     <div className="col-span-2 mt-2">
                                        <span className="text-gray-500 block">GPS</span>
                                        <code className="bg-gray-100 px-2 py-1 rounded">{project.gpsCoordinates || 'Not pinned'}</code>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Contract</CardTitle></CardHeader>
                                <CardContent className="space-y-3 text-sm">
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
                                <CardHeader><CardTitle>Team Summary</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <p className="text-3xl font-bold text-indigo-600">{project.teamCount || 0}</p>
                                        <p className="text-sm text-gray-500">Assigned Members</p>
                                        <Button variant="link" onClick={() => document.getElementById('tab-team')?.click()}>Manage Team</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TEAM TAB */}
                <TabsContent value="team" className="mt-6">
                    <TeamManagement projectId={project.id} projectOwnerId={project.ownerId} />
                </TabsContent>

                {/* MILESTONES TAB */}
                <TabsContent value="milestones" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Milestones</CardTitle>
                            <CardDescription>Track key deliverables and deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-gray-500">
                                <Flag className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                <p>Milestone tracking coming soon.</p>
                                <p className="text-sm">Use this tab to track Approval Requests and Deadlines.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SCOPES TAB */}
                <TabsContent value="scopes" className="mt-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Project Scopes</CardTitle>
                            <CardDescription>Defined work categories for this project.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-gray-500">
                                <Layers className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                <p>Scope definition viewer coming soon.</p>
                                <p className="text-sm">Scopes will be defined by the Lead Engineer.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Project Documents</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-gray-500">
                                <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                <p>Document repository coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProjectDetails;
