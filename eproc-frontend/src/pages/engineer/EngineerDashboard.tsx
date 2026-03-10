import { useAuth } from '@/context/AuthContext';
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
import {
  DashboardAlerts,
  UpcomingMilestonesWidget,
  ActivityFeedWidget,
  ExpectedDeliveriesWidget,
  DashboardRequestsWidget
} from '@/components/domain/dashboard';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { getProgressColor } from '@/lib/po-stats';

/**
 * Engineer Dashboard - daily operational view.
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

  const data = dashboard!;

  const stats: StatCardProps[] = [
    {
      label: 'Total Requests',
      value: data.totalRequests || 0,
      icon: FileText,
      color: 'blue' as const,
      subtitle: 'All time',
    },
    {
      label: 'Pending',
      value: data.pendingRequests || 0,
      icon: Clock,
      color: 'amber' as const,
      subtitle: 'Awaiting approval',
    },
    {
      label: 'Approved',
      value: data.approvedRequests || 0,
      icon: CheckCircle,
      color: 'green' as const,
      subtitle: 'Successful requests',
    },
    {
      label: 'Rejected',
      value: data.rejectedRequests || 0,
      icon: XCircle,
      color: 'red' as const,
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
            <Link to="/engineer/requests/new">
              + New Request
            </Link>
          </Button>
        }
      />

      <SummaryStatGrid stats={stats} />

      {/* Main Grid: Assignement + Budget, widgets */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Project Assignment & Budget & Milestones */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Assigned Project Card + Budget */}
          {data.assignedProjectId ? (
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#2a3455]" />
                    Assigned Project
                  </div>
                  <ProjectStatusBadge status={data.projectStatus || 'UNKNOWN'} />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Link
                        to="/engineer/project"
                        className="text-xl font-bold text-slate-900 hover:text-[#2a3455] transition-colors"
                      >
                        {data.assignedProjectName}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">
                        Owner: <span className="font-medium text-slate-700">{data.ownerName}</span>
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="text-[#2a3455] border-[#2a3455]/20 hover:bg-[#2a3455]/5 mt-2">
                      <Link to="/engineer/project" className="flex items-center gap-1">
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Budget Section inside Project Card */}
                  <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Project Budget Utilization</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-bold text-slate-900">{formatCurrency(data.totalBudget - data.remainingBudget, true)} spent</span>
                        <span className="text-slate-500">{formatCurrency(data.totalBudget, true)} total</span>
                      </div>
                      <Progress
                        value={data.totalBudget > 0 ? ((data.totalBudget - data.remainingBudget) / data.totalBudget) * 100 : 0}
                        className="h-2 bg-slate-200"
                        indicatorClassName={getProgressColor(data.totalBudget > 0 ? ((data.totalBudget - data.remainingBudget) / data.totalBudget) * 100 : 0)}
                      />
                      <p className="text-xs text-slate-500 font-medium text-right">
                        {formatCurrency(data.remainingBudget, true)} remaining
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-0">
                <EmptyState
                  icon={Briefcase}
                  title="No project assigned"
                  description="Contact your manager or project owner to get started."
                  className="py-12"
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <ExpectedDeliveriesWidget deliveries={data.expectedDeliveries} />
            <UpcomingMilestonesWidget milestones={data.projectMilestones} />
          </div>
        </div>

        {/* Right Column: Alerts & Activity */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {data.alerts && data.alerts.length > 0 && (
            <DashboardAlerts alerts={data.alerts} />
          )}
          <ActivityFeedWidget activities={data.activityFeed} />
          <DashboardRequestsWidget
            title="My Requests"
            requests={data.recentRequests ?? []}
            actionLabel="All Requests"
            actionPath="/requests"
            priority="processed"
          />
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
