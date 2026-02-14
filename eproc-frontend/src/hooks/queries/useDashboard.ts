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
