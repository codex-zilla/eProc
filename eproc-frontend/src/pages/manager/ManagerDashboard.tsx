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
  const { data: dashboard, isLoading, error: queryError } = useManagerDashboard();

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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm mt-4">
        <span className="font-bold">Error:</span> {error}
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
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-row items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0 sm:mt-1">
            Here's your project and resource overview.
          </p>
        </div>
        <div className="flex justify-end gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigateRole('/requests')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
          >
            <span className="hidden sm:inline">View Requests</span>
            <span className="sm:hidden">Requests</span>
          </button>
          <button
            onClick={() => navigateRole('/projects/new')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#2a3455] rounded-md hover:bg-[#1e253e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2 flex items-center shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryStatGrid stats={stats} />

      {/* Dashboard Content Grid */}
      <div className="mt-6">
        {/* Mobile & Tablet Layout (< 1024px) */}
        <div className="flex flex-col gap-6 lg:hidden">
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
