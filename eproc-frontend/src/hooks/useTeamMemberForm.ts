import { useState, useEffect } from 'react';
import type { ProjectAssignment, UserSummary } from '@/types/models';
import type { TeamMemberPayload } from '@/components/domain/projects/TeamMemberFormModal';

export const useTeamMemberForm = (
    editingAssignment: ProjectAssignment | null,
    isOpen: boolean,
    onSave: (payload: TeamMemberPayload, editingAssignmentId?: number) => Promise<void>,
    availableUsers: UserSummary[],
    projectOwnerId?: number
) => {
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [startDate, setStartDate] = useState('');
    const [responsibility, setResponsibility] = useState('FULL');

    useEffect(() => {
        if (isOpen) {
            if (editingAssignment) {
                setSelectedUser(editingAssignment.userId.toString());
                setSelectedRole(editingAssignment.role);
                setResponsibility(editingAssignment.responsibilityLevel);
                setStartDate(editingAssignment.startDate);
            } else {
                setSelectedUser('');
                setSelectedRole('');
                setStartDate('');
                setResponsibility('FULL');
            }
        }
    }, [isOpen, editingAssignment]);

    const handleSave = async () => {
        if (!selectedUser || !selectedRole || !startDate) return;

        await onSave({
            userId: parseInt(selectedUser),
            role: selectedRole,
            responsibilityLevel: responsibility,
            startDate: startDate
        }, editingAssignment?.id);
    };

    // Filter available users based on role
    const filteredUsers = availableUsers.filter(u => {
        if (!selectedRole) return true;

        // 1. For System Engineers, only allow Project Engineer roles
        if (u.role === 'ENGINEER') {
            if (!selectedRole.includes('ENGINEER')) return false;
            return u.erbNumber && u.erbNumber.length > 0;
        }

        // 2. For System Accountants, only allow Project Accountant roles
        if (u.role === 'ACCOUNTANT') {
            if (!selectedRole.includes('ACCOUNTANT')) return false;
            if (projectOwnerId && u.createdById) {
                return Number(u.createdById) === Number(projectOwnerId);
            }
            return true;
        }

        // 3. For System Managers, only allow Project Manager roles
        // Accounting for any legacy strings or different casing
        if (u.role === 'MANAGER' || u.role === 'PROJECT_MANAGER' as any) {
            if (!selectedRole.includes('MANAGER')) return false;
            if (projectOwnerId && u.createdById) {
                return Number(u.createdById) === Number(projectOwnerId);
            }
            return true;
        }

        // 4. If the selected project role is reserved for specific system roles, 
        // prevent other system roles (like ADMIN/OWNER) from taking them if they don't match exactly.
        if (selectedRole.includes('ENGINEER') || selectedRole.includes('ACCOUNTANT') || selectedRole.includes('MANAGER')) {
            return false;
        }

        // For other custom or undefined roles, allow selection
        return true;
    });

    return {
        selectedUser,
        setSelectedUser,
        selectedRole,
        setSelectedRole,
        startDate,
        setStartDate,
        responsibility,
        setResponsibility,
        filteredUsers,
        handleSave
    };
};
