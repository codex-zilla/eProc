import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, User, Trash2, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/models';

interface ProjectUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  activeProjectCount: number;
  projects: Array<{
    id: number;
    projectId: number;
    projectName: string;
    role: string;
    responsibilityLevel: string;
    startDate: string;
    endDate?: string;
  }>;
  requirePasswordChange: boolean;
  active: boolean;
}

const ManageProjectUsers = () => {
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  
  // Assignment dialog state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignRole, setAssignRole] = useState('');
  const [assignStartDate, setAssignStartDate] = useState('');
  const [assignResponsibility, setAssignResponsibility] = useState('FULL');
  const [assignError, setAssignError] = useState<string | null>(null);

  // Create user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserProject, setNewUserProject] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserStartDate, setNewUserStartDate] = useState('');
  const [newUserResponsibility, setNewUserResponsibility] = useState('FULL');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: number; projectId: number; userName: string; projectName: string } | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [usersData, projectsData] = await Promise.all([
        projectService.getMyProjectUsers(),
        projectService.getAllProjects()
      ]);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Connection failed. Please check your internet connection and try again.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);

    if (!newUserName || !newUserEmail || !newUserRole || !newUserProject || !newUserStartDate) {
      setCreateError('Please fill in all required fields');
      return;
    }

    try {
      await projectService.createProjectUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        projectId: parseInt(newUserProject),
        phoneNumber: newUserPhone || undefined,
        startDate: newUserStartDate,
        responsibilityLevel: newUserResponsibility
      });

      setCreateSuccess(true);
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('');
      setNewUserProject('');
      setNewUserPhone('');
      setNewUserStartDate('');
      setNewUserResponsibility('FULL');
      
      // Reload data
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create user. Please try again.';
      setCreateError(msg);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId || !assignProjectId || !assignRole || !assignStartDate) return;
    setAssignError(null);

    try {
      await projectService.assignUserToProject(
        selectedUserId,
        parseInt(assignProjectId),
        assignRole,
        assignStartDate,
        assignResponsibility
      );

      setIsAssignOpen(false);
      resetAssignForm();
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign user. Please try again.';
      setAssignError(msg);
    }
  };

  const handleRemoveFromProject = async () => {
    if (!deleteConfirm) return;

    try {
      await projectService.removeUserFromProject(deleteConfirm.userId, deleteConfirm.projectId);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Failed to remove user from project', err);
    }
  };

  const openAssignDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsAssignOpen(true);
  };

  const resetAssignForm = () => {
    setSelectedUserId(null);
    setAssignProjectId('');
    setAssignRole('');
    setAssignStartDate('');
    setAssignResponsibility('FULL');
    setAssignError(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
          <Button variant="ghost" size="sm" onClick={loadData} className="text-red-700 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="create">Create New User</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Users */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  {searchTerm ? 'No users found matching your search.' : 'No users created yet. Create your first user in the "Create New User" tab.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-indigo-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{user.name}</span>
                              <Badge variant={user.activeProjectCount > 0 ? 'default' : 'secondary'}>
                                {user.activeProjectCount > 0 ? `Active (${user.activeProjectCount} project${user.activeProjectCount > 1 ? 's' : ''})` : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {user.email} • {user.activeProjectCount > 0 
                                ? [...new Set(user.projects.map(p => p.role.replace('PROJECT_', '')))].join(', ')
                                : 'No Active Projects'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAssignDialog(user.id)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign to Project
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                          >
                            {expandedUserId === user.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded project assignments */}
                      {expandedUserId === user.id && user.projects.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                          <div className="text-sm font-semibold text-slate-700 mb-3">Project Assignments:</div>
                          <div className="space-y-2">
                            {user.projects.map((project) => (
                              <div key={project.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200">
                                <div className="flex items-center gap-3">
                                  <Building className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-900">{project.projectName}</div>
                                    <div className="text-xs text-slate-500">
                                      {project.role.replace('PROJECT_', '')} • {project.responsibilityLevel} • Since {project.startDate}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm({
                                    userId: user.id,
                                    projectId: project.projectId,
                                    userName: user.name,
                                    projectName: project.projectName
                                  })}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Create New User */}
        <TabsContent value="create">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Create a new PROJECT_MANAGER or PROJECT_ACCOUNTANT user with a default password of <code className="bg-slate-100 px-1.5 py-0.5 rounded">123456</code>. 
                The user will be required to change their password on first login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  User created successfully! They can now log in with password:123456
                </div>
              )}
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">System Role *</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole} required>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                        <SelectItem value="PROJECT_ACCOUNTANT">Project Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+255 xxx xxx xxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Assign to Project *</Label>
                    <Select value={newUserProject} onValueChange={setNewUserProject} required>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newUserStartDate}
                      onChange={(e) => setNewUserStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibility">Responsibility Level *</Label>
                    <Select value={newUserResponsibility} onValueChange={setNewUserResponsibility}>
                      <SelectTrigger id="responsibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL">Full</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="ADVISORY">Advisory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign User to Project Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={(open) => { setIsAssignOpen(open); if (!open) resetAssignForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Project</DialogTitle>
            <DialogDescription>
              Assign this user to another project with a specific role.
            </DialogDescription>
          </DialogHeader>
          {assignError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {assignError}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={assignRole} onValueChange={setAssignRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                  <SelectItem value="PROJECT_ACCOUNTANT">Project Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input type="date" value={assignStartDate} onChange={(e) => setAssignStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Responsibility</Label>
              <Select value={assignResponsibility} onValueChange={setAssignResponsibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="ADVISORY">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignUser} disabled={!assignProjectId || !assignRole || !assignStartDate}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User from Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteConfirm?.userName}</strong> from <strong>{deleteConfirm?.projectName}</strong>? 
              This will end their assignment but the user account will remain active for other projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveFromProject}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProjectUsers;
