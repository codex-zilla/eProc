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

    // Only owner/admin can edit team
    const canEdit = currentUser?.id === projectOwnerId || currentUser?.role === 'PROJECT_MANAGER'; // Simplified, really should be if isOwner

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

    const handleAddMember = async () => {
        if (!selectedUser || !selectedRole || !startDate) return;
        try {
            await projectService.addTeamMember(projectId, {
                userId: parseInt(selectedUser),
                role: selectedRole,
                responsibilityLevel: responsibility,
                startDate: startDate
            });
            setIsAddOpen(false);
            resetForm();
            loadTeam();
        } catch (e) {
            console.error("Failed to add member", e);
            // Optionally show error toast
        }
    };

    const handleRemoveMember = async (assignmentId: number) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            await projectService.removeTeamMember(projectId, assignmentId);
            loadTeam();
        } catch (e) {
            console.error("Failed to remove", e);
        }
    };

    const resetForm = () => {
        setSelectedUser('');
        setSelectedRole('');
        setStartDate('');
        setResponsibility('FULL');
    };

    // Filter users based on selected role to prevent mismatch (e.g. assigning QS as Engineer)
    // For now, allow all, but ideally we match user.role with ProjectRole
    const filteredUsers = availableUsers.filter(u => {
        if (!selectedRole) return true;
        // Simple heuristic: if Role contains ENGINEER, user role should be ENGINEER
        if (selectedRole.includes('ENGINEER')) return u.role === 'ENGINEER';
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
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={loadAvailableUsers} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Project Member</DialogTitle>
                                <DialogDescription>Assign a user to a specific role on this project.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ProjectRole).map(role => (
                                                <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>User</Label>
                                    <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!selectedRole}>
                                        <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                                        <SelectContent>
                                            {filteredUsers.map(u => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.name} ({u.role})
                                                </SelectItem>
                                            ))}
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
                                <Button onClick={handleAddMember} disabled={!selectedUser || !selectedRole}>Assign</Button>
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
                                <div className="flex items-center gap-4">
                                    <div className="text-right text-xs text-gray-500 hidden sm:block">
                                        <p>Since: {member.startDate}</p>
                                        {member.endDate && <p>Until: {member.endDate}</p>}
                                    </div>
                                    {canEdit && (
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TeamManagement;
