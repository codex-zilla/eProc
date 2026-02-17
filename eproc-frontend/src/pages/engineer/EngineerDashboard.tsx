import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { useEngineerDashboard } from '@/hooks/queries/useDashboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';




/**
 * Engineer Dashboard - daily operational view.
 * Updated for Role Model Overhaul: boss → owner
 */
const EngineerDashboard = () => {
  const { user } = useAuth();
  const { data: dashboard, isLoading, error } = useEngineerDashboard();

  // Calculate error message for display
  const errorMessage = error instanceof Error ? error.message : (error ? 'An error occurred loading the dashboard' : null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-slate-900 text-xl md:text-3xl tracking-tight font-semibold">Welcome back, {user?.name}.</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
            <Link to="/engineer/create-batch">
              + New Request
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Total Requests */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="h-16 w-16 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-900">Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-2xl font-bold text-slate-900">{dashboard?.totalRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">All time</p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-16 w-16 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-900">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-2xl font-bold text-slate-900">{dashboard?.pendingRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Awaiting approval</p>
          </CardContent>
        </Card>

        {/* Approved Requests */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-900">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-2xl font-bold text-slate-900">{dashboard?.approvedRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Successful requests</p>
          </CardContent>
        </Card>

        {/* Rejected Requests */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-900">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-2xl font-bold text-slate-900">{dashboard?.rejectedRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Action needed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Assigned Project Card */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Assigned Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.assignedProjectId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <Link
                      to="/engineer/project"
                      className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {dashboard.assignedProjectName}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">
                      Owner: <span className="font-medium text-slate-700">{dashboard.ownerName}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${dashboard.projectStatus === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                    {dashboard.projectStatus}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    <Link to="/engineer/project" className="flex items-center gap-1">
                      View Project Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium">No project assigned</p>
                <p className="text-sm text-slate-500 mt-1">
                  Contact your project owner to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EngineerDashboard;
