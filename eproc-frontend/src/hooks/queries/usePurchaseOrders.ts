import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getProjectPurchaseOrders, 
  getPurchaseOrder, 
  createPurchaseOrder, 
  closePurchaseOrder,
  type CreatePurchaseOrderDTO 
} from "@/services/procurementService"; // Note: procurementService exports functions directly
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";

export const usePurchaseOrders = (projectId?: number) => {
  return useQuery({
    queryKey: projectId ? queryKeys.purchaseOrders.byProject(projectId) : queryKeys.purchaseOrders.all,
    queryFn: () => 
      projectId 
        ? getProjectPurchaseOrders(projectId)
        : Promise.reject("Fetch all POs not implemented/supported yet"), // procurementService only has getProjectPurchaseOrders
    enabled: !!projectId,
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
      // Also invalidate project list? Maybe.
    },
    onError: (error) => handleError(error, "Failed to close purchase order"),
  });
};
