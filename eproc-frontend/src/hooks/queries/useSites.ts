import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";
import type { Site } from "@/types/models";

export const useSites = (projectId?: number) => {
  // If projectId is provided, fetch sites for that project.
  // Otherwise fetch all sites (if backend supports it, which it does: getAllSites).
  return useQuery({
    queryKey: projectId ? queryKeys.sites.byProject(projectId) : queryKeys.sites.all,
    queryFn: () =>
      projectId
        ? projectService.getSitesByProject(projectId)
        : projectService.getAllSites(),
    enabled: projectId !== undefined || !projectId, // Always enabled unless logic requires otherwise
  });
};

export const useCreateSite = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: Partial<Site>) => projectService.createSite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      if (variables.projectId) {
         queryClient.invalidateQueries({ queryKey: queryKeys.sites.byProject(variables.projectId) });
      }
    },
    onError: (error) => handleError(error, "Failed to create site"),
  });
};

export const useUpdateSite = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Site> }) =>
      projectService.updateSite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      // Invalidate all project sites is safest since we might not know original project ID easily without extra logic
      // But usually 'all' or specific page refresh is enough.
      // Better: invalidate all sites queries.
    },
    onError: (error) => handleError(error, "Failed to update site"),
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (id: number) => projectService.deleteSite(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
    },
    onError: (error) => handleError(error, "Failed to delete site"),
  });
};
