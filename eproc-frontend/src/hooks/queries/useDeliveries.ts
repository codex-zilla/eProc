import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getDeliveriesForPO, 
  recordDelivery, 
  type CreateDeliveryDTO 
} from "@/services/procurementService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";

// Note: queryKeys need to be updated to support 'byPO' if not present.
// Current queryKeys.deliveries only has 'all', 'byId', 'byProject'.
// 'getDeliveriesForPO' fetches by PO ID.
// I will assume specific key ["deliveries", "po", poId] for now.

export const useDeliveries = (purchaseOrderId: number) => {
  return useQuery({
    queryKey: ["deliveries", "po", purchaseOrderId],
    queryFn: () => getDeliveriesForPO(purchaseOrderId),
    enabled: !!purchaseOrderId,
  });
};

export const useRecordDelivery = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: CreateDeliveryDTO) => recordDelivery(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries", "po", variables.purchaseOrderId] });
      // Invalidate PO as well since delivery status might change
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.byId(variables.purchaseOrderId) });
    },
    onError: (error) => handleError(error, "Failed to record delivery"),
  });
};
