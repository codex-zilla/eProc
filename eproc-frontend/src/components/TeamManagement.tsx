import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, User, Pencil, Users } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { formatRole } from '@/lib/team-utils';
import { TeamMemberFormModal } from './domain/projects/TeamMemberFormModal';
import { useTeamManagement } from '@/hooks/useTeamManagement';

interface TeamManagementProps {
    projectId: number;
    projectOwnerId?: number;
}

const TeamManagement = ({ projectId, projectOwnerId }: TeamManagementProps) => {
    const {
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
    } = useTeamManagement(projectId, projectOwnerId);

    return (
        <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] border-s-4 border-[#2a3455] ps-2">Team Assignments</h3>
                {canEdit && (
                    <Button
                        size="sm"
                        onClick={() => handleOpenDialog(true)}
                        className="bg-[#2a3455] hover:bg-[#1e256e] text-white shadow-sm rounded-lg h-8 px-4 text-xs font-medium cursor-pointer"
                    >
                        Add Member
                    </Button>
                )}
            </div>

            <TeamMemberFormModal
                isOpen={isAddOpen}
                onClose={handleOpenDialog}
                onSave={handleSaveMember}
                editingAssignment={editingAssignment}
                availableUsers={availableUsers}
                team={team}
                saving={isSaving}
                error={formError}
                projectOwnerId={projectOwnerId}
            />

            <div className="">
                {isLoadingTeam ? <p className="text-slate-500 animate-pulse text-sm px-1.5">Loading team...</p> : (
                    <div>
                        {team.length === 0 && (
                            <div className="py-6">
                                <EmptyState
                                    icon={Users}
                                    title="No team members assigned"
                                    description="Assign engineers and managers to start collaborating."
                                />
                            </div>
                        )}
                        {team.length > 0 && (
                            <div className="space-y-4 py-1">
                                {sortedTeam.map(member => (
                                    <div key={member.id} className="flex items-start gap-3 relative group rounded-lg p-2 hover:bg-slate-50/50 transition-colors -mx-2">
                                        <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-full shrink-0 mt-0.5">
                                            <User className="h-4 w-4 text-[#1e256e]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{member.userName}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{member.userEmail || 'No email provided'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#1e256e]">{formatRole(member.role)}</p>
                                                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium tracking-wide">Resp: {member.responsibilityLevel}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <div className="text-[10px] text-slate-500 text-right pr-2">
                                                <p>Since: <span className="font-medium text-slate-700">{member.startDate}</span></p>
                                                {member.endDate && <p>Until: <span className="font-medium text-slate-700">{member.endDate}</span></p>}
                                            </div>
                                            {canEdit && Number(member.userId) !== Number(currentUser?.id) && (
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="lg" onClick={() => handleEditMember(member)} className="text-[#2a3455] hover:text-[#1e256e] hover:bg-blue-50 h-8 w-8 p-0 rounded-md shrink-0">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>

                                                    <Button variant="ghost" size="lg" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-md shrink-0">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this member from the project? This action can be undone by adding them back.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmationId(null)} className="rounded-lg">Cancel</Button>
                        <Button variant="destructive" onClick={confirmRemoveMember} className="rounded-lg">Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamManagement;
