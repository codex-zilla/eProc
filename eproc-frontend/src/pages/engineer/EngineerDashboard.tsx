import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { useEngineerDashboard } from '@/hooks/queries/useDashboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryStatGrid } from '@/components/common/SummaryStatGrid';
import type { StatCardProps } from '@/components/common/StatCard';
import ProjectStatusBadge from '@/components/domain/ProjectStatusBadge';
import { EmptyState } from '@/components/common/EmptyState';

/**
 * Engineer Dashboard - daily operational view.
 * Updated for Role Model Overhaul: boss → owner
 */
const EngineerDashboard = () => {
  const { user } = useAuth();
  const { data: dashboard, isLoading, error, refetch } = useEngineerDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Welcome back, ${user?.name}.`} />
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Failed to load dashboard data"
        />
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      label: 'Requests',
      value: dashboard?.totalRequests || 0,
      icon: FileText,
      color: 'blue',
      subtitle: 'All time',
    },
    {
      label: 'Pending',
      value: dashboard?.pendingRequests || 0,
      icon: Clock,
      color: 'amber',
      subtitle: 'Awaiting approval',
    },
    {
      label: 'Approved',
      value: dashboard?.approvedRequests || 0,
      icon: CheckCircle,
      color: 'green',
      subtitle: 'Successful requests',
    },
    {
      label: 'Rejected',
      value: dashboard?.rejectedRequests || 0,
      icon: XCircle,
      color: 'red',
      subtitle: 'Action needed',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your project requests and delivery overview"
        actions={
          <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
            <Link to="/engineer/create-batch">
              + New Request
            </Link>
          </Button>
        }
      />

      <SummaryStatGrid stats={stats} />

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
                  <ProjectStatusBadge status={dashboard.projectStatus || 'UNKNOWN'} />
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
              <EmptyState
                icon={Briefcase}
                title="No project assigned"
                description="Contact your project owner to get started."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineerDashboard;
