import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, Users, HardHat, FileText } from 'lucide-react';

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

/**
 * Manager Dashboard - overview of projects and requests.
 */
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
        <div className="flex flex-col items-center gap-2">
            <Activity className="h-8 w-8 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's an overview of your projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
             <Link to="/manager/projects/new">
                Create Project
             </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.totalProjects || 0} total projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.approvedRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Material requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engineers
            </CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.availableEngineers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available for assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Recent */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
            <CardDescription>
              Quick access to your project management tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
             <Link to="/manager/projects" className="group block space-y-2 rounded-lg border p-4 pt-3 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Manage Projects</span>
                </div>
                <p className="text-sm text-muted-foreground">View all {dashboard?.totalProjects || 0} projects and their status.</p>
             </Link>
             <Link to="/manager/pending" className="group block space-y-2 rounded-lg border p-4 pt-3 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-500/10 p-2 text-amber-500 group-hover:bg-amber-500 group-hover:text-amber-50 group-hover:text-white transition-colors">
                        <Clock className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Review Requests</span>
                </div>
                <p className="text-sm text-muted-foreground">{dashboard?.pendingRequests || 0} requests awaiting your approval.</p>
             </Link>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Engineer Utilization</CardTitle>
             <CardDescription>
              {(dashboard?.assignedEngineers || 0)} of {(dashboard?.assignedEngineers || 0) + (dashboard?.availableEngineers || 0)} engineers assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Assigned</p>
                        <p className="text-sm text-muted-foreground">{dashboard?.assignedEngineers || 0} engineers</p>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Available</p>
                        <p className="text-sm text-muted-foreground">{dashboard?.availableEngineers || 0} engineers</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
