import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Calendar, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  currency: string;
  budgetTotal: number;
  status: string;
  bossId: number;
  bossName: string;
  engineerId: number | null;
  engineerName: string | null;
  engineerEmail: string | null;
}

interface AvailableEngineer {
  id: number;
  name: string;
  email: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [availableEngineers, setAvailableEngineers] = useState<AvailableEngineer[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [projectRes, engineersRes] = await Promise.all([
        api.get<Project>(`/projects/${id}`),
        api.get<AvailableEngineer[]>(`/projects/available-engineers`),
      ]);
      setProject(projectRes.data);
      setAvailableEngineers(engineersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignEngineer = async () => {
    if (!selectedEngineerId) return;
    setError(null);
    try {
      await api.patch(
        `/projects/${id}/engineer`,
        { engineerId: parseInt(selectedEngineerId) }
      );
      setSuccess('Engineer assigned successfully!');
      setSelectedEngineerId('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign engineer');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setError(null);
    try {
      await api.patch(
        `/projects/${id}/status`,
        { status: newStatus }
      );
      setSuccess(`Project marked as ${newStatus}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-destructive font-semibold">Project not found</p>
        <Button variant="outline" asChild>
           <Link to="/manager/projects">Go back to Projects</Link>
        </Button>
      </div>
    );
  }


  
  // Custom badge styling for specific status colors if needed, or use default variants
  const statusColorClass = (status: string) => {
      switch (status) {
        case 'ACTIVE': return 'bg-green-500 hover:bg-green-600';
        case 'COMPLETED': return 'bg-blue-500 hover:bg-blue-600';
        case 'CANCELLED': return 'bg-red-500 hover:bg-red-600';
        default: return '';
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-3">
                {project.name}
                <Badge className={statusColorClass(project.status)}>{project.status}</Badge>
            </h1>

            {/* Action Buttons */}
             {project.status === 'ACTIVE' && (
                <div className="flex flex-wrap gap-2 w-full">
                   <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('COMPLETED')} className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none">
                     <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('CANCELLED')} className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none">
                     <XCircle className="mr-2 h-4 w-4" /> Cancel Project
                   </Button>
                </div>
             )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> Assigned to: {project.engineerName || 'Unassigned'}</span>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <span className="flex items-center gap-1"> Budget: {project.currency} {project.budgetTotal.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
           <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
          {success}
           <button onClick={() => setSuccess(null)} className="float-right font-bold">×</button>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {/* Dummy description since we don't have it in API yet */}
                            Construction project involving site preparation, foundation work, and structural erection.
                            Currently tracking on budget and schedule.
                        </p>
                        <div className="mt-6">
                             <div className="flex justify-between text-sm mb-2">
                                <span>Completion Estimate</span>
                                <span className="font-medium">65%</span>
                             </div>
                             <Progress value={65} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Site</span>
                            <span className="text-sm font-medium">Site A (Dummy)</span>
                        </div>
                         <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Start Date</span>
                            <span className="text-sm font-medium">Oct 15, 2023</span>
                        </div>
                         <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Manager</span>
                            <span className="text-sm font-medium">{project.bossName}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Engineer Assignment Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Engineer</CardTitle>
                    <CardDescription>Manage the lead engineer for this project.</CardDescription>
                </CardHeader>
                <CardContent>
                     {project.engineerId ? (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50/50">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-green-100 text-green-700">EN</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-gray-900">{project.engineerName}</h4>
                                <p className="text-sm text-muted-foreground">{project.engineerEmail}</p>
                            </div>
                        </div>
                    ) : project.status === 'ACTIVE' ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                              <div className="grid w-full gap-1.5">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Assign Engineer</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background md:text-sm"
                                    value={selectedEngineerId}
                                    onChange={(e) => setSelectedEngineerId(e.target.value)}
                                >
                                    <option value="">Select an engineer...</option>
                                    {availableEngineers.map(eng => (
                                    <option key={eng.id} value={eng.id}>{eng.name} ({eng.email})</option>
                                    ))}
                                </select>
                              </div>
                              <Button onClick={handleAssignEngineer} disabled={!selectedEngineerId}>Assign</Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No engineer assigned. Project is not active.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Material Requests</CardTitle>
                    <CardDescription>Manage material requests associated with this project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="bg-muted p-4 rounded-full">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                         <div className="max-w-md text-sm text-muted-foreground">
                            View and approve material requests for {project.name}.
                         </div>
                         <Button asChild>
                             <Link to={`/manager/pending?projectId=${project.id}`}>
                                View Requests
                             </Link>
                         </Button>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">No invoices available.</p></CardContent>
             </Card>
        </TabsContent>
        
        <TabsContent value="team" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Team management coming soon.</p></CardContent>
             </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
