import { useState } from 'react';
import { type ProjectAssignment } from '@/types/models';
import { useAuth } from '@/context/AuthContext';
import { sortTeamMembers } from '@/lib/team-utils';
import {
    useProjectTeam,
    useAvailableEngineers,
    useAddTeamMember,
    useUpdateTeamMember,
    useRemoveTeamMember
} from '@/hooks/queries/useTeam';
import type { TeamMemberPayload } from '@/components/domain/projects/TeamMemberFormModal';
import { toast } from 'sonner';

export const useTeamManagement = (projectId: number, projectOwnerId?: number) => {
    const { user: currentUser } = useAuth();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ProjectAssignment | null>(null);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Queries
    const { data: team = [], isLoading: isLoadingTeam } = useProjectTeam(projectId);
    const { data: availableUsers = [] } = useAvailableEngineers();

    // Mutations
    const { mutateAsync: addMember, isPending: isAdding } = useAddTeamMember();
    const { mutateAsync: updateMember, isPending: isUpdating } = useUpdateTeamMember();
    const { mutateAsync: removeMember } = useRemoveTeamMember();

    // Only the project owner or system admin can edit team
    const canEdit = (currentUser?.id && projectOwnerId && Number(currentUser.id) === Number(projectOwnerId)) || currentUser?.role === 'SYSTEM_ADMIN';

    const handleSaveMember = async (payload: TeamMemberPayload, assignmentId?: number) => {
        setFormError(null);
        try {
            if (assignmentId) {
                await updateMember({ projectId, assignmentId, data: payload });
                toast.success('Team member updated successfully');
            } else {
                await addMember({ projectId, data: payload });
                toast.success('Team member added successfully');
            }
            setIsAddOpen(false);
            setEditingAssignment(null);
        } catch (e: any) {
            const msg = e.response?.data?.message || "Failed to save member. Please try again.";
            setFormError(msg);
        }
    };

    const handleEditMember = (member: ProjectAssignment) => {
        setEditingAssignment(member);
        setIsAddOpen(true);
    };

    const handleRemoveMember = (assignmentId: number) => {
        setDeleteConfirmationId(assignmentId);
    };

    const confirmRemoveMember = async () => {
        if (!deleteConfirmationId) return;
        try {
            await removeMember({ projectId, assignmentId: deleteConfirmationId });
            toast.success('Team member removed successfully');
        } catch (e) {
            console.error("Failed to remove", e);
        } finally {
            setDeleteConfirmationId(null);
        }
    };

    const handleOpenDialog = (open: boolean) => {
        setIsAddOpen(open);
        setFormError(null);
        if (!open) {
            setEditingAssignment(null);
        }
    };

    const sortedTeam = sortTeamMembers(team);
    const isSaving = isAdding || isUpdating;

    return {
        team,
        sortedTeam,
        isLoadingTeam,
        availableUsers,
        isAddOpen,
        editingAssignment,
        deleteConfirmationId,
        formError,
        isSaving,
        canEdit,
        currentUser,
        handleOpenDialog,
        handleSaveMember,
        handleEditMember,
        handleRemoveMember,
        confirmRemoveMember,
        setDeleteConfirmationId
    };
};
