import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, User } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { ProjectRole, ResponsibilityLevel, type ProjectAssignment, type UserSummary } from '@/types/models';
import { useAuth } from '@/context/AuthContext';

interface TeamManagementProps {
    projectId: number;
    projectOwnerId?: number;
}

const TeamManagement = ({ projectId, projectOwnerId }: TeamManagementProps) => {
    const { user: currentUser } = useAuth();
    const [team, setTeam] = useState<ProjectAssignment[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Form State
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [startDate, setStartDate] = useState('');
    const [responsibility, setResponsibility] = useState('FULL');

    const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Only the project owner or system admin can edit team
    const canEdit = (currentUser?.id && projectOwnerId && Number(currentUser.id) === Number(projectOwnerId)) || currentUser?.role === 'SYSTEM_ADMIN';

    useEffect(() => {
        loadTeam();
    }, [projectId]);

    const loadTeam = async () => {
        try {
            const data = await projectService.getProjectTeam(projectId);
            setTeam(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableUsers = async () => {
        try {
            const users = await projectService.getAvailableEngineers();
            setAvailableUsers(users);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveMember = async () => {
        if (!selectedUser || !selectedRole || !startDate) return;
        setError(null);
        try {
            const payload = {
                userId: parseInt(selectedUser),
                role: selectedRole,
                responsibilityLevel: responsibility,
                startDate: startDate
            };

            if (editingAssignmentId) {
                await projectService.updateTeamMember(projectId, editingAssignmentId, payload);
            } else {
                await projectService.addTeamMember(projectId, payload);
            }
            
            setIsAddOpen(false);
            setEditingAssignmentId(null);
            resetForm();
            loadTeam();
        } catch (e: any) {
            const msg = e.response?.data?.message || "Failed to save member. Please try again.";
            setError(msg);
        }
    };

    const handleEditMember = (member: ProjectAssignment) => {
        setEditingAssignmentId(member.id);
        setSelectedUser(member.userId.toString());
        setSelectedRole(member.role);
        setResponsibility(member.responsibilityLevel);
        setStartDate(member.startDate);
        // Ensure we have the user list loaded so the dropdown works
        if (availableUsers.length === 0) {
            loadAvailableUsers();
        }
        setIsAddOpen(true);
    };

    const handleRemoveMember = (assignmentId: number) => {
        setDeleteConfirmationId(assignmentId);
    };

    const confirmRemoveMember = async () => {
        if (!deleteConfirmationId) return;
        try {
            await projectService.removeTeamMember(projectId, deleteConfirmationId);
            loadTeam();
        } catch (e) {
            console.error("Failed to remove", e);
        } finally {
            setDeleteConfirmationId(null);
        }
    };

    const resetForm = () => {
        setSelectedUser('');
        setSelectedRole('');
        setStartDate('');
        setResponsibility('FULL');
        setEditingAssignmentId(null);
    };

    const handleOpenDialog = (open: boolean) => {
        setIsAddOpen(open);
        setError(null);
        if (!open) {
            resetForm();
        } else if (!editingAssignmentId) {
           loadAvailableUsers();
        }
    };

    // Filter users based on selected role to prevent mismatch (e.g. assigning QS as Engineer)
    // For now, allow all, but ideally we match user.role with ProjectRole
    // Filter available users
    // Ideally we match user.role with ProjectRole compatibility
    const filteredUsers = availableUsers.filter(u => {
        if (!selectedRole) return true;
        
        // Engineer roles require an ENGINEER system user
        if (selectedRole.includes('ENGINEER')) {
            if (u.role !== 'ENGINEER') return false;
            // Also require valid ERB number for engineers
            return u.erbNumber && u.erbNumber.length > 0;
        }
        
        return true;
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Assignments</CardTitle>
                    <CardDescription>Manage project staff and authorities.</CardDescription>
                </div>
                {canEdit && (
                    <Dialog open={isAddOpen} onOpenChange={handleOpenDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingAssignmentId ? 'Edit Assignment' : 'Add Project Member'}</DialogTitle>
                                <DialogDescription>
                                    {editingAssignmentId ? 'Update role and responsibilities.' : 'Assign a user to a specific role on this project.'}
                                </DialogDescription>
                            </DialogHeader>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-2">
                                    {error}
                                </div>
                            )}
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ProjectRole)
                                                .filter(role => role !== ProjectRole.OWNER)
                                                .map(role => (
                                                <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>User</Label>
                                    <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!selectedRole || !!editingAssignmentId}>
                                        <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                                        <SelectContent>
                                            {/* If editing, show the current user even if not in available list immediately */}
                                             {editingAssignmentId && !filteredUsers.find(u => u.id.toString() === selectedUser) && (
                                                <SelectItem key={selectedUser} value={selectedUser}>
                                                    Current User
                                                </SelectItem>
                                            )}
                                            {filteredUsers.map(u => {
                                                const isAssigned = team.some(member => member.userId === u.id);
                                                return (
                                                    <SelectItem key={u.id} value={u.id.toString()} disabled={isAssigned}>
                                                        {u.name} ({u.role}) {isAssigned ? '(Active)' : ''}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Responsibility</Label>
                                    <Select value={responsibility} onValueChange={setResponsibility}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ResponsibilityLevel).map(l => (
                                                <SelectItem key={l} value={l}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveMember} disabled={!selectedUser || !selectedRole || !startDate || !responsibility}>
                                    {editingAssignmentId ? 'Update' : 'Assign'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading team...</p> : (
                    <div className="space-y-4">
                        {team.length === 0 && <p className="text-gray-500 italic">No team members assigned.</p>}
                        {team.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <User className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{member.userName}</p>
                                        <p className="text-xs text-gray-500">{member.role.replace('_', ' ')} • {member.responsibilityLevel}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right text-xs text-gray-500 hidden sm:block mr-2">
                                        <p>Since: {member.startDate}</p>
                                        {member.endDate && <p>Until: {member.endDate}</p>}
                                    </div>
                                    {canEdit && (
                                        <>
                                            {/* Edit/Delete Buttons - Hidden for self */}
                                            {Number(member.userId) !== Number(currentUser?.id) && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 p-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                    </Button>

                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
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
                        <Button variant="outline" onClick={() => setDeleteConfirmationId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmRemoveMember}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
        </Card>
    );
};

export default TeamManagement;
