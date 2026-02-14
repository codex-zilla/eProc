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

export const useRequest = (id: number) => {
  return useQuery({
    queryKey: queryKeys.requests.byId(id),
    queryFn: () => requestService.getRequestById(id),
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

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      requestService.updateRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(variables.id) });
    },
    onError: (error) => handleError(error, "Failed to update request"),
  });
};

export const useProcessApproval = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, action, comment }: { id: number; action: string; comment?: string }) =>
      requestService.processApproval(id, { status: action as any, comment }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(variables.id) });
    },
    onError: (error) => handleError(error, "Failed to process request approval"),
  });
};
