import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useErrorHandler } from "../useErrorHandler";
import { queryKeys } from "./query-keys";

export const useMyProjectUsers = () => {
    return useQuery({
        queryKey: ['project-users', 'my'],
        queryFn: () => projectService.getMyProjectUsers(),
    });
};

export const useCreateProjectUser = () => {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: (data: {
            name: string;
            email: string;
            role: string;
            projectId: number;
            phoneNumber?: string;
            startDate: string;
            responsibilityLevel?: string;
        }) => projectService.createProjectUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-users', 'my'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }); // Potentially affects project team counts?
        },
        onError: (error) => handleError(error, "Failed to create user"),
    });
};

export const useAssignUserToProject = () => {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: ({ userId, projectId, role, startDate, responsibilityLevel }: {
            userId: number;
            projectId: number;
            role: string;
            startDate: string;
            responsibilityLevel: string;
        }) => projectService.assignUserToProject(userId, projectId, role, startDate, responsibilityLevel),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['project-users', 'my'] });
        },
        onError: (error) => handleError(error, "Failed to assign user to project"),
    });
};

export const useRemoveUserFromProject = () => {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: ({ userId, projectId }: { userId: number; projectId: number }) =>
            projectService.removeUserFromProject(userId, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-users', 'my'] });
        },
        onError: (error) => handleError(error, "Failed to remove user from project"),
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: ({ userId, data }: {
            userId: number;
            data: {
                name: string;
                email: string;
                phoneNumber?: string;
            }
        }) => projectService.updateUser(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-users', 'my'] });
        },
        onError: (error) => handleError(error, "Failed to update user"),
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: (userId: number) => projectService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-users', 'my'] });
        },
        onError: (error) => handleError(error, "Failed to delete user"),
    });
};
