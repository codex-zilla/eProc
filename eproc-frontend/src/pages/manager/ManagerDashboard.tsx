import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, ArrowRight, Briefcase } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ManagerDashboardData {
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  assignedEngineers: number;
  availableEngineers: number;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get<ManagerDashboardData>('/dashboard/manager');
        setDashboard(response.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
            <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const utilizationRate = dashboard ? Math.round((dashboard.assignedEngineers / (dashboard.assignedEngineers + dashboard.availableEngineers || 1)) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-700 mt-1">Welcome back, {user?.name}. </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
             <Link to="/manager/projects/new">
                + New Project
             </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="h-20 w-20 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Total Projects
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.totalProjects || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {dashboard?.activeProjects || 0} active, {dashboard?.completedProjects || 0} completed
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
             <Link to="/manager/projects" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
             </Link>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-20 w-20 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Pending Requests
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.pendingRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Requires approval
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
            <Link to="/manager/pending" className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center hover:underline">
               Review requests <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="h-20 w-20 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Active Resources
            </CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
               <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.assignedEngineers || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Engineers utilized
            </p>
            <Progress value={utilizationRate} className="h-1.5 mt-3 bg-slate-100" indicatorClassName="bg-indigo-500" />
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium flex items-center">
               {utilizationRate}% Utilization
            </span>
          </CardFooter>
        </Card>

        {/* Quick Action: New Project - styled as a card */}
        {/* <Card className="border-0 shadow-md bg-slate-900 text-white hover:shadow-lg hover:bg-slate-800 transition-all duration-300 cursor-pointer overflow-hidden relative group">
           <Link to="/manager/projects/new" className="absolute inset-0 z-20"></Link>
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-24 w-24 text-white" />
           </div>
           <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FileText className="h-5 w-5 text-white" /> 
                 </div>
                 New Project
              </CardTitle>
           </CardHeader>
           <CardContent className="relative z-10">
              <p className="text-slate-300 text-sm">Create and assign a new construction project.</p>
           </CardContent>
           <CardFooter className="relative z-10 pt-0">
               <div className="text-sm font-medium text-white flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  Start Now <ArrowRight className="ml-2 h-4 w-4" />
               </div>
           </CardFooter>
        </Card> */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {/* Recent Projects Placeholder / List */}
         <Card className="col-span-2 border-slate-200 shadow-sm">
            <CardHeader>
               <CardTitle className="text-lg font-bold text-slate-900">Recent Projects</CardTitle>
               <CardDescription>Latest projects updated in the system.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-white border flex items-center justify-center text-slate-400">
                               <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="font-semibold text-slate-900 text-sm">Renovation Project Alpha</p>
                               <p className="text-xs text-slate-500">Updated 2 hours ago</p>
                            </div>
                         </div>
                         <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                      </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter>
               <Button variant="outline" className="w-full text-slate-600" asChild>
                  <Link to="/manager/projects">View All Projects</Link>
               </Button>
            </CardFooter>
         </Card>


      </div>
    </div>
  );
};

export default ManagerDashboard;
