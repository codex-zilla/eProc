import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getProjectPurchaseOrders, 
  getPurchaseOrder, 
  createPurchaseOrder, 
  updatePurchaseOrder,
  closePurchaseOrder,
  type CreatePurchaseOrderDTO,
  type UpdatePurchaseOrderDTO 
} from "@/services/procurementService"; 
import { projectService } from "@/services/projectService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";
import type { Project } from "@/types/models";

export const usePurchaseOrders = (projectId?: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: projectId ? queryKeys.purchaseOrders.byProject(projectId) : queryKeys.purchaseOrders.all,
    queryFn: () => 
      projectId 
        ? getProjectPurchaseOrders(projectId)
        : fetchAllPurchaseOrders(), 
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

// Helper function to aggregate POs from all projects
const fetchAllPurchaseOrders = async () => {
  try {
    const projects: Project[] = await projectService.getAllProjects();
    const allPOs = await Promise.all(
      projects.map((project: Project) => 
        getProjectPurchaseOrders(project.id)
          .catch(err => {
            console.error(`Failed to fetch POs for project ${project.id}:`, err);
            return [];
          })
      )
    );
    return allPOs.flat();
  } catch (error) {
    console.error("Failed to fetch all purchase orders", error);
    throw error;
  }
};

export const useAllPurchaseOrders = () => {
    return useQuery({
        queryKey: queryKeys.purchaseOrders.all,
        queryFn: fetchAllPurchaseOrders,
    });
};

export const usePurchaseOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.byId(id),
    queryFn: () => getPurchaseOrder(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDTO) => createPurchaseOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      // Invalidate requests to update 'orderedQuantity' (Global remaining balance)
      // Since we know the project ID, we can be specific
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byProject(variables.projectId) });
    },
    onError: (error) => handleError(error, "Failed to create purchase order"),
  });
};

export const useClosePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (id: number) => closePurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      // Also invalidate project list? Maybe.
    },
    onError: (error) => handleError(error, "Failed to close purchase order"),
  });
};


export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderDTO }) => updatePurchaseOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.byId(variables.id) });
      // Invalidate requests to update 'orderedQuantity' (Global remaining balance)
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
    onError: (error) => handleError(error, "Failed to update purchase order"),
  });
};
