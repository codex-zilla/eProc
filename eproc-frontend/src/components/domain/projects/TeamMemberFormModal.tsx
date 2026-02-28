import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GenericModal } from '@/components/common/GenericModal';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { ProjectRole, ResponsibilityLevel, type ProjectAssignment, type UserSummary } from '@/types/models';

export interface TeamMemberPayload {
    userId: number;
    role: string;
    responsibilityLevel: string;
    startDate: string;
}

interface TeamMemberFormModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    onSave: (payload: TeamMemberPayload, editingAssignmentId?: number) => Promise<void>;
    editingAssignment: ProjectAssignment | null;
    availableUsers: UserSummary[];
    team: ProjectAssignment[];
    saving: boolean;
    error: string | null;
    projectOwnerId?: number;
}

import { useTeamMemberForm } from '@/hooks/useTeamMemberForm';

export const TeamMemberFormModal = ({
    isOpen,
    onClose,
    onSave,
    editingAssignment,
    availableUsers,
    team,
    saving,
    error,
    projectOwnerId
}: TeamMemberFormModalProps) => {
    const {
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
    } = useTeamMemberForm(editingAssignment, isOpen, onSave, availableUsers, projectOwnerId);

    const isEditing = !!editingAssignment;

    const modalFooter = (
        <Button
            onClick={handleSave}
            disabled={!selectedUser || !selectedRole || !startDate || !responsibility || saving}
            className="rounded-lg w-full font-semibold sm:w-auto bg-[#2a3455] hover:bg-[#1e256e]"
        >
            {saving ? 'Saving...' : (isEditing ? 'Update' : 'Assign')}
        </Button>
    );

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Assignment' : 'Add Project Member'}
            description={isEditing ? 'Update role and responsibilities.' : 'Assign a user to a specific role on this project.'}
            footer={modalFooter}
        >
            {error && (
                <ErrorDisplay
                    error={null}
                    message={error}
                    variant="inline"
                    title="Failed to save member"
                    className="mb-4"
                />
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} disabled={saving}>
                        <SelectTrigger className='border-[#2a3455]/60'><SelectValue placeholder="Select Role" /></SelectTrigger>
                        <SelectContent>
                            {Object.values(ProjectRole)
                                .filter(role => role !== ProjectRole.PROJECT_OWNER)
                                .map(role => (
                                    <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>User</Label>
                    <Select
                        value={selectedUser}
                        onValueChange={setSelectedUser}
                        disabled={!selectedRole || isEditing || (filteredUsers.length === 0 && !isEditing) || saving}
                    >
                        <SelectTrigger className='border-[#2a3455]/60'>
                            <SelectValue placeholder={
                                !selectedRole ? "Select Role first" :
                                    (filteredUsers.length === 0 && !isEditing) ? "No eligible users found" :
                                        "Select User"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {isEditing && !filteredUsers.find(u => u.id.toString() === selectedUser) && (
                                <SelectItem key={selectedUser} value={selectedUser}>
                                    Current User
                                </SelectItem>
                            )}
                            {filteredUsers.length === 0 && !isEditing ? (
                                <SelectItem value="no-users" disabled className="text-muted-foreground">No eligible users found</SelectItem>
                            ) : (
                                filteredUsers.map(u => {
                                    const isAssigned = team.some(member => member.userId === u.id);
                                    return (
                                        <SelectItem key={u.id} value={u.id.toString()} disabled={isAssigned}>
                                            {u.name} {isAssigned ? '(Active)' : ''}
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Responsibility</Label>
                    <Select value={responsibility} onValueChange={setResponsibility} disabled={saving}>
                        <SelectTrigger className='border-[#2a3455]/60'><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.values(ResponsibilityLevel).map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input className='border-[#2a3455]/60' type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={saving} />
                </div>
            </div>
        </GenericModal>
    );
};
