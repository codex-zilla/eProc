import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";
import type { Project } from "@/types/models";

export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => projectService.getAllProjects(),
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: queryKeys.projects.byId(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (data: Partial<Project>) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => handleError(error, "Failed to create project"),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byId(variables.id) });
    },
    onError: (error) => handleError(error, "Failed to update project"),
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      projectService.updateProjectStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byId(variables.id) });
    },
    onError: (error) => handleError(error, "Failed to update project status"),
  });
};
