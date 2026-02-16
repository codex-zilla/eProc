import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios"; // ManagerDashboard uses api directly
import { queryKeys } from "./query-keys";

// Types from ManagerDashboard.tsx
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

// Types from AccountantDashboard.tsx
export interface AccountantDashboardData {
  stats: {
    approvedCount: number;
    orderedCount: number;
    partiallyDeliveredCount: number;
    fullyDeliveredCount: number;
    totalOrderedValue: number;
    underOrderedCount: number;
    overDeliveredCount: number;
    damagedDeliveriesCount: number;
  };
  recentPOs: {
    id: number;
    poNumber: string;
    vendor: string;
    createdAt: string;
    amount: number;
    status: 'Received' | 'Partial' | 'Ordered' | 'Pending';
  }[];
  recentDeliveries: {
    id: number;
    poNumber: string;
    deliveredDate: string;
    itemCount: number;
  }[];
  alerts: {
    id: string;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info';
    actionText?: string;
  }[];
}

const getAccountantDashboard = async (): Promise<AccountantDashboardData> => {
  // Mock data as backend endpoint doesn't exist yet
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          approvedCount: 24,
          orderedCount: 18,
          partiallyDeliveredCount: 8,
          fullyDeliveredCount: 10,
          totalOrderedValue: 45500000,
          underOrderedCount: 3,
          overDeliveredCount: 1,
          damagedDeliveriesCount: 2
        },
        recentPOs: [
          { id: 1, poNumber: 'PO-23-089', vendor: 'Dangote Cement', createdAt: '2026-10-24T10:30:00', amount: 12500000, status: 'Received' },
          { id: 2, poNumber: 'PO-23-090', vendor: 'Simba Steel', createdAt: '2026-10-23T14:15:00', amount: 4200000, status: 'Partial' },
          { id: 3, poNumber: 'PO-23-091', vendor: 'Tanzania Electric', createdAt: '2026-10-22T09:45:00', amount: 850000, status: 'Ordered' },
          { id: 4, poNumber: 'PO-23-092', vendor: 'Kiboko Paints', createdAt: '2026-10-21T16:00:00', amount: 1200000, status: 'Pending' },
        ],
        alerts: [
          { id: '1', title: 'Over-delivered Item', description: 'PO-23-089: Received 550 bags of cement, ordered 500.', type: 'danger', actionText: 'Review Discrepancy' },
          { id: '2', title: 'Under-ordered Rebar', description: 'Project plan requires +200kg for Phase 2 foundation.', type: 'warning' },
          { id: '3', title: 'Pending Invoice Approval', description: 'Simba Steel invoice #4402 is awaiting your sign-off.', type: 'info' },
        ],
        recentDeliveries: [
          { id: 1, poNumber: 'PO-23-089', deliveredDate: '2026-02-10T11:00:00', itemCount: 5 },
          { id: 2, poNumber: 'PO-23-090', deliveredDate: '2026-02-09T16:30:00', itemCount: 3 },
        ]
      });
    }, 800);
  });
};

export const useAccountantDashboard = () => {
    return useQuery({
        queryKey: queryKeys.dashboard.accountant,
        queryFn: getAccountantDashboard,
    });
};
