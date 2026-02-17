import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestService } from "@/services/requestService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";

export const useRequests = (projectId?: number) => {
  return useQuery({
    queryKey: projectId ? ["requests", projectId] : ["requests"],
    queryFn: () => requestService.getRequests(),
    select: (data) => projectId ? data.filter(r => r.projectId === projectId) : data,
  });
};



export const useProjectRequests = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.requests.byProject(projectId),
    queryFn: () => requestService.getProjectRequests(projectId),
    enabled: !!projectId,
  });
};

export const useRequest = (id: number) => {
  return useQuery({
    queryKey: queryKeys.requests.byId(id),
    queryFn: () => requestService.getRequestById(id),
    enabled: !!id,
  });
};

export const useRequestHistory = (id: number) => {
  return useQuery({
    queryKey: ['request-history', id],
    queryFn: () => requestService.getRequestHistory(id),
    enabled: !!id,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: any) => requestService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
    onError: (error) => handleError(error, "Failed to create request"),
  });
};

export const useCreateBatchRequests = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: any[]) => requestService.createBatchRequests(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
    onError: (error) => handleError(error, "Failed to create batch requests"),
  });
};

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      requestService.updateRequest(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.byId(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.all });

      // Snapshot the previous value
      const previousRequest = queryClient.getQueryData(queryKeys.requests.byId(id));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.requests.byId(id), (old: any) => ({
        ...old,
        ...data,
      }));

      // Return a context object with the snapshotted value
      return { previousRequest };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.requests.byId(id), context.previousRequest);
      }
      handleError(error, "Failed to update request");
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(id) });
    },
  });
};

export const useProcessApproval = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, action, comment }: { id: number; action: string; comment?: string }) =>
      requestService.processApproval(id, { status: action as any, comment }),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.byId(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.all });

      const previousRequest = queryClient.getQueryData(queryKeys.requests.byId(id));

      queryClient.setQueryData(queryKeys.requests.byId(id), (old: any) => ({
        ...old,
        status: action,
      }));

      return { previousRequest };
    },
    onError: (error, { id }, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.requests.byId(id), context.previousRequest);
      }
      handleError(error, "Failed to process request approval");
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(id) });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ requestId, materialId, data }: { requestId: number; materialId: number; data: any }) => {
      // If data contains status, it's a status update (approve/reject)
      if (data.status === 'APPROVED' || data.status === 'REJECTED') {
        return requestService.updateMaterialStatus(requestId, materialId, data.status, data.comment);
      }
      // Otherwise it's a details update
      return requestService.updateMaterial(requestId, materialId, data);
    },
    onMutate: async ({ requestId, materialId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.byId(requestId) });

      const previousRequest = queryClient.getQueryData(queryKeys.requests.byId(requestId));

      queryClient.setQueryData(queryKeys.requests.byId(requestId), (old: any) => {
        if (!old) return old;
        
        // Handle material status update in the items/materials array
        // Assuming 'items' is the array name based on usual API response, 
        // fallback to 'materials' if items is undefined, or just return old if structure is different
        // In models.ts RequestDetail has 'items: MaterialItem[]'
        
        const newItems = old.items?.map((item: any) => 
          item.id === materialId ? { ...item, ...data } : item
        ) || [];

        return {
          ...old,
          items: newItems
        };
      });

      return { previousRequest };
    },
    onError: (error, { requestId }, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.requests.byId(requestId), context.previousRequest);
      }
      handleError(error, "Failed to update material");
    },
    onSettled: (_, __, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(requestId) });
    },
  });
};
