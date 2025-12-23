import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Users, ArrowRight, Briefcase, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await axios.get<ManagerDashboardData>(
          `${API_BASE}/api/dashboard/manager`,
          { headers: getAuthHeaders() }
        );
        setDashboard(response.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [getAuthHeaders]);

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
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
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
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Total Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboard?.totalProjects || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {dashboard?.activeProjects || 0} active, {dashboard?.completedProjects || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboard?.pendingRequests || 0}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Requires approval
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-4">
            <Link to="/manager/pending" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center hover:underline">
               Review requests <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Active Resources
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboard?.assignedEngineers || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Engineers currently assigned
            </p>
            <Progress value={utilizationRate} className="h-1.5 mt-3 bg-slate-100" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Approved Items
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboard?.approvedRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Materials processed
            </p>
          </CardContent>
        </Card>
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

         {/* Quick Actions */}
         <Card className="border-slate-200 shadow-sm">
            <CardHeader>
               <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full justify-start h-12 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-slate-200" asChild>
                  <Link to="/manager/projects/new">
                     <FileText className="mr-2 h-4 w-4" /> Create New Project
                  </Link>
               </Button>
               <Button variant="outline" className="w-full justify-start h-12 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-slate-200" asChild>
                  <Link to="/manager/pending">
                     <Clock className="mr-2 h-4 w-4" /> Review Pending Requests
                  </Link>
               </Button>
               <Button variant="outline" className="w-full justify-start h-12 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-slate-200">
                     <Users className="mr-2 h-4 w-4" /> Manage Engineers
               </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
