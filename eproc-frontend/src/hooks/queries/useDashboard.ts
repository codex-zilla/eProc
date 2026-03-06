import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "./query-keys";

// Shared request summary type used by Manager and Engineer dashboards
export interface DashboardRequestSummary {
  id: number;
  title: string;
  projectName: string;
  siteName: string | null;
  createdByName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface ManagerDashboardData {
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  assignedEngineers: number;
  availableEngineers: number;
  
  // New Analytics Fields
  procurementStats: {
    approvedRequestsCount: number;
    totalPOsCount: number;
    openPOsCount: number;
    partiallyDeliveredCount: number;
    deliveredCount: number;
    totalCommittedValue: number;
    openPOsValue: number;
    deliveredValue: number;  // TZS value of DELIVERED/CLOSED POs
  };
  projectBudgets: {
    projectId: number;
    projectName: string;
    currency: string;
    budgetTotal: number;
    committedAmount: number;
    utilizationPct: number;
  }[];
  upcomingMilestones: {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    dueDate: string;
    status: string;
    isOverdue: boolean;
  }[];
  siteActivity: {
    siteId: number;
    siteName: string;
    projectName: string;
    activeRequestsCount: number;
    totalSpend: number;
  }[];
  averageApprovalTimeHours: number;
  alerts: {
    type: string;
    severity: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    referenceId?: number;
  }[];
  /** PENDING-first request summary for quick access card */
  pendingRequestSummaries: DashboardRequestSummary[];
}

const getManagerDashboard = async (): Promise<ManagerDashboardData> => {
    const response = await api.get<ManagerDashboardData>('/dashboard/manager');
    return response.data;
}

export const useManagerDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.manager,
    queryFn: getManagerDashboard,
  });
};

export interface EngineerDashboardData {
  assignedProjectId: number | null;
  assignedProjectName: string | null;
  projectStatus: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalRequests: number;

  // New Analytics Fields
  remainingBudget: number;
  totalBudget: number;
  expectedDeliveries: {
    poId: number;
    poNumber: string;
    expectedDate: string;
    vendorName: string;
    itemsCount: number;
    status: string;
  }[];
  projectMilestones: {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    dueDate: string;
    status: string;
    isOverdue: boolean;
  }[];
  activityFeed: {
    id: string; // Generated ID
    type: string; // 'REQUEST' | 'DELIVERY' | 'MILESTONE' | 'SYSTEM'
    title: string;
    description: string;
    timestamp: string;
    status?: string | null;
  }[];
  alerts: {
    type: string;
    severity: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    referenceId?: number;
  }[];
  /** APPROVED/REJECTED-first request summary for quick access card */
  recentRequests: DashboardRequestSummary[];
}

const getEngineerDashboard = async (): Promise<EngineerDashboardData> => {
  const response = await api.get<EngineerDashboardData>('/dashboard/engineer');
  return response.data;
};

export const useEngineerDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.engineer, // Note: Need to ensure queryKeys.dashboard.engineer exists
    queryFn: getEngineerDashboard,
  });
};

export interface AccountantDashboardData {
  stats: {
    approvedRequestsCount: number;
    totalPOsCount: number;
    openPOsCount: number;
    partiallyDeliveredCount: number;
    deliveredCount: number;
    totalCommittedValue: number;
    openPOsValue: number;
    deliveredValue: number;  // TZS value of DELIVERED/CLOSED POs
  };
  budgetOverview: {
    projectId: number;
    projectName: string;
    currency: string;
    budgetTotal: number;
    committedAmount: number;
    utilizationPct: number;
  }[];
  recentPOs: {
    id: number;
    poNumber: string;
    projectName: string;
    siteName: string;
    vendorName: string;
    status: string;
    totalValue: number;
    createdAt: string;
    updatedAt: string;
  }[];
  recentApprovedRequests: {
    id: number;
    projectName: string;
    siteName: string;
    createdByName: string;
    title: string;
    updatedAt: string;
  }[];
  monthlySpend: {
    month: string;
    committed: number;
    delivered: number;
  }[];
  alerts: {
    type: string;
    severity: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    referenceId?: number;
  }[];
}

const getAccountantDashboard = async (): Promise<AccountantDashboardData> => {
  const response = await api.get<AccountantDashboardData>('/dashboard/accountant');
  return response.data;
};

export const useAccountantDashboard = () => {
    return useQuery({
        queryKey: queryKeys.dashboard.accountant,
        queryFn: getAccountantDashboard,
    });
};
