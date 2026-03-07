import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  Users,
  Clock,
  Plus,
  CheckCircle
} from 'lucide-react';
import { SummaryStatGrid } from '@/components/common/SummaryStatGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  DashboardAlerts,
  SiteActivityWidget,
  DashboardRequestsWidget
} from '@/components/domain/dashboard';
import { BudgetOverviewList } from '@/components/domain/dashboard/BudgetOverviewList';
import { useManagerDashboard } from '@/hooks/queries/useDashboard';

const ManagerDashboard = () => {
  const navigateRole = useRoleNavigate();
  const { user } = useAuth();
  const { data: dashboard, isLoading, error: queryError, refetch } = useManagerDashboard();

  const error = queryError ? (queryError as Error).message || 'Failed to load dashboard data' : null;

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
        <ErrorDisplay
          error={queryError as Error}
          onRetry={() => refetch()}
          title="Failed to load dashboard data"
        />
      </div>
    );
  }

  const data = dashboard!;

  const stats = [
    {
      label: "Total Projects",
      value: data.totalProjects || 0,
      icon: Briefcase,
      color: "blue" as const,
    },
    {
      label: "Active Resources",
      value: data.assignedEngineers || 0,
      icon: Users,
      color: "purple" as const,
    },
    {
      label: "Pending Requests",
      value: data.pendingRequests || 0,
      icon: Clock,
      color: "amber" as const,
    },
    {
      label: "Procurement Active",
      value: data.procurementStats?.openPOsCount || 0,
      icon: CheckCircle,
      color: "green" as const,
      className: "sm:col-span-2 lg:col-span-1"
    }
  ];

  return (
    <div className="space-y-2 min-w-0">
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Here's your project and resource overview."
        actions={
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={() => navigateRole('/projects/new')}
              className="text-xs sm:text-sm bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <SummaryStatGrid stats={stats} />

      {/* Dashboard Content Grid */}
      <div className="my-3">
        {/* Mobile & Tablet Layout (< 1024px) */}
        <div className="flex flex-col gap-3 lg:hidden">
          {data.alerts && data.alerts.length > 0 && (
            <div className="w-full">
              <DashboardAlerts alerts={data.alerts} />
            </div>
          )}
          <DashboardRequestsWidget
            title="Pending Requests"
            requests={data.pendingRequestSummaries ?? []}
            actionLabel="View All"
            actionPath="/requests"
            priority="pending"
          />
          <BudgetOverviewList data={data.projectBudgets || []} />
          <SiteActivityWidget siteActivity={data.siteActivity} />
        </div>

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
          {/* Main Content Column (2 cols) */}
          <div className="flex flex-col col-span-2 gap-6">
            <DashboardRequestsWidget
              title="Pending Requests"
              requests={data.pendingRequestSummaries ?? []}
              actionLabel="View All Requests"
              actionPath="/requests"
              priority="pending"
            />
            <SiteActivityWidget siteActivity={data.siteActivity} />
          </div>

          {/* Sidebar Column (1 col) */}
          <div className="flex flex-col col-span-1 gap-6">
            <DashboardAlerts alerts={data.alerts} />
            <BudgetOverviewList data={data.projectBudgets || []} title="Project Budgets" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
