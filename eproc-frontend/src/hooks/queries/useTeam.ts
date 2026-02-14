import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";
import type { CreateAssignmentRequest } from "@/types/models";

export const useProjectTeam = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.projects.users(projectId),
    queryFn: () => projectService.getProjectTeam(projectId),
    enabled: !!projectId,
  });
};

export const useAvailableEngineers = () => {
  return useQuery({
    queryKey: ["users", "available-engineers"],
    queryFn: () => projectService.getAvailableEngineers(),
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateAssignmentRequest }) =>
      projectService.addTeamMember(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.users(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: ["users", "available-engineers"] });
    },
    onError: (error) => handleError(error, "Failed to add team member"),
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ projectId, assignmentId }: { projectId: number; assignmentId: number }) =>
      projectService.removeTeamMember(projectId, assignmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.users(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: ["users", "available-engineers"] });
    },
    onError: (error) => handleError(error, "Failed to remove team member"),
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ projectId, assignmentId, data }: { projectId: number; assignmentId: number; data: Partial<CreateAssignmentRequest> }) =>
      projectService.updateTeamMember(projectId, assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.users(variables.projectId) });
    },
    onError: (error) => handleError(error, "Failed to update team member"),
  });
};
