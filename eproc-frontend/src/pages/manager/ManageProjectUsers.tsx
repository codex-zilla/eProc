import { useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, User, Trash2, Building, ChevronDown, ChevronUp, Edit, UserX } from 'lucide-react';
import { useProjects } from '@/hooks/queries/useProjects';
import {
  useMyProjectUsers,
  useCreateProjectUser,
  useAssignUserToProject,
  useRemoveUserFromProject,
  useUpdateUser,
  useDeleteUser
} from '@/hooks/queries/useProjectUsers';

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
  // Queries
  const {
    data: usersData = [],
    isLoading: usersLoading,
    error: usersError
  } = useMyProjectUsers();

  const users = usersData as ProjectUser[];

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError
  } = useProjects();

  const loading = usersLoading || projectsLoading;
  const error = (usersError as Error)?.message || (projectsError as Error)?.message || null;

  const { handleError } = useErrorHandler();

  // Mutations
  const createUserMutation = useCreateProjectUser();
  const assignUserMutation = useAssignUserToProject();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const removeUserFromProjectMutation = useRemoveUserFromProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Assignment dialog state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignRole, setAssignRole] = useState('');
  const [assignStartDate, setAssignStartDate] = useState('');
  const [assignResponsibility, setAssignResponsibility] = useState('FULL');

  // Create user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserProject, setNewUserProject] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserStartDate, setNewUserStartDate] = useState('');
  const [newUserResponsibility, setNewUserResponsibility] = useState('FULL');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Edit user dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');

  // Delete user confirmation
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ userId: number; userName: string } | null>(null);

  // Delete from project confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: number; projectId: number; userName: string; projectName: string } | null>(null);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess(false);
    setFieldErrors({});

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!newUserName.trim()) {
      errors.name = 'Name is required';
    }
    if (!newUserEmail.trim()) {
      errors.email = 'Email is required';
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserEmail)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    if (!newUserRole) {
      errors.role = 'Project Role is required';
    }
    if (!newUserProject) {
      errors.project = 'Project assignment is required';
    }
    if (!newUserStartDate) {
      errors.startDate = 'Start Date is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    createUserMutation.mutate({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      projectId: parseInt(newUserProject),
      phoneNumber: newUserPhone?.trim() || undefined,
      startDate: newUserStartDate,
      responsibilityLevel: newUserResponsibility
    }, {
      onSuccess: () => {
        setCreateSuccess(true);
        // Reset form
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('');
        setNewUserProject('');
        setNewUserPhone('');
        setNewUserStartDate('');
        setNewUserResponsibility('FULL');

        // Clear success message after 3 seconds
        setTimeout(() => setCreateSuccess(false), 3000);
      }
    });
  };

  const handleAssignUser = () => {
    if (!selectedUserId || !assignProjectId || !assignRole || !assignStartDate) {
      handleError(new Error('Please fill in all required fields'), 'Validation Error');
      return;
    }

    assignUserMutation.mutate({
      userId: selectedUserId,
      projectId: parseInt(assignProjectId),
      role: assignRole,
      startDate: assignStartDate,
      responsibilityLevel: assignResponsibility
    }, {
      onSuccess: () => {
        setIsAssignOpen(false);
        resetAssignForm();
      }
    });
  };

  const handleRemoveFromProject = () => {
    if (!deleteConfirm) return;

    removeUserFromProjectMutation.mutate({
      userId: deleteConfirm.userId,
      projectId: deleteConfirm.projectId
    }, {
      onSuccess: () => {
        setDeleteConfirm(null);
      }
    });
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
  };

  const openEditDialog = (user: ProjectUser) => {
    setEditUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPhone(user.phoneNumber || '');
    setIsEditOpen(true);
  };

  const resetEditForm = () => {
    setEditUserId(null);
    setEditUserName('');
    setEditUserEmail('');
    setEditUserPhone('');
  };

  const handleEditUser = async () => {
    if (!editUserId) return;

    // Validate required fields
    if (!editUserName.trim()) {
      handleError(new Error('Name is required'), 'Validation Error');
      return;
    }
    if (!editUserEmail.trim()) {
      handleError(new Error('Email is required'), 'Validation Error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserEmail)) {
      handleError(new Error('Please enter a valid email address'), 'Validation Error');
      return;
    }

    updateUserMutation.mutate({
      userId: editUserId,
      data: {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phoneNumber: editUserPhone?.trim() || undefined
      }
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        resetEditForm();
      }
    });
  };

  const handleDeleteUser = () => {
    if (!deleteUserConfirm) return;

    deleteUserMutation.mutate(deleteUserConfirm.userId, {
      onSuccess: () => {
        setDeleteUserConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
          {/* Retry button could be added here if needed, but react-query handles retries. 
              If we want manual retry, we'd need refetch functions from hooks. 
              For now, simplifying. */}
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="users" className="text-xs sm:text-sm data-[state=active]:bg-[#2a3455] data-[state=active]:text-white">All Users</TabsTrigger>
          <TabsTrigger value="create" className="text-xs sm:text-sm data-[state=active]:bg-[#2a3455] data-[state=active]:text-white">Create New User</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Users */}
        <TabsContent value="users" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-3 sm:p-4 pb-3 sm:pb-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-full sm:max-w-sm">
                  <Search className="absolute left-2 sm:left-2.5 top-2 sm:top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8 sm:pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors h-8 sm:h-10 text-xs sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {loading ? (
                <div className="text-center py-8 sm:py-10 text-slate-500 text-xs sm:text-sm">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 sm:py-10 text-slate-500 text-xs sm:text-sm">
                  {searchTerm ? 'No users found matching your search.' : 'No users created yet. Create your first user in the "Create New User" tab.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white hover:bg-slate-50 transition-colors gap-3">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 w-full">
                          <div className="bg-[#2a3455]/10 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#2a3455]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">{user.name}</span>
                              <Badge
                                variant={user.activeProjectCount > 0 ? 'default' : 'secondary'}
                                className={`text-[10px] sm:text-xs w-fit ${user.activeProjectCount > 0 ? 'bg-[#2a3455] hover:bg-[#1e253e]' : ''}`}
                              >
                                {user.activeProjectCount > 0 ? `Active (${user.activeProjectCount} project${user.activeProjectCount > 1 ? 's' : ''})` : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 break-words">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-8 text-xs sm:text-sm px-2 sm:px-3"
                            title="Edit User"
                          >
                            <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDialog(user.id)}
                            className="text-[#2a3455] hover:text-[#1e253e] hover:bg-[#2a3455]/10 border-[#2a3455]/30 h-8 text-xs sm:text-sm px-2 sm:px-3"
                            title="Assign to Project"
                          >
                            <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline ml-1">Assign</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteUserConfirm({ userId: user.id, userName: user.name })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 text-xs sm:text-sm px-2 sm:px-3"
                            title="Delete User Permanently"
                          >
                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline ml-1">Delete</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            className="h-8 w-8 p-0"
                            title={expandedUserId === user.id ? "Collapse" : "Expand"}
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
                        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
                          <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Project Assignments:</div>
                          <div className="space-y-2">
                            {user.projects.map((project) => (
                              <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white rounded-md border border-slate-200 gap-2">
                                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">{project.projectName}</div>
                                    <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                      <span className="block sm:inline">{project.role.replace('PROJECT_', '')}</span>
                                      <span className="hidden sm:inline"> • </span>
                                      <span className="block sm:inline">{project.responsibilityLevel}</span>
                                      <span className="hidden sm:inline"> • </span>
                                      <span className="block sm:inline">Since {project.startDate}</span>
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
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 sm:h-8 w-7 sm:w-8 p-0"
                                  title="Remove from Project"
                                >
                                  <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
        <TabsContent value="create" className="mt-3 sm:mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Create New User</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Create a new MANAGER or ACCOUNTANT user with a default password of <code className="bg-slate-100 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs">123456</code>.
                The user will be required to change their password on first login.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
                  User created successfully! They can now log in with password:123456
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={newUserName}
                      onChange={(e) => {
                        setNewUserName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.name;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="John Doe"
                      className={`h-9 sm:h-10 text-sm ${fieldErrors.name ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
                  </div>

                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => {
                        setNewUserEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="john@example.com"
                      className={`h-9 sm:h-10 text-sm ${fieldErrors.email ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                  </div>

                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="role" className="text-xs sm:text-sm font-medium">Project Role <span className="text-red-500">*</span></Label>
                    <Select value={newUserRole} onValueChange={(v) => {
                      setNewUserRole(v);
                      if (fieldErrors.role) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.role;
                          return newErrors;
                        });
                      }
                    }}>
                      <SelectTrigger id="role" className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.role ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANAGER" className="text-xs sm:text-sm">Project Manager</SelectItem>
                        <SelectItem value="ACCOUNTANT" className="text-xs sm:text-sm">Project Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.role && <p className="text-xs text-red-500">{fieldErrors.role}</p>}
                  </div>

                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+255 xxx xxx xxx"
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>

                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="project" className="text-xs sm:text-sm font-medium">Assign to Project <span className="text-red-500">*</span></Label>
                    <Select value={newUserProject} onValueChange={(v) => {
                      setNewUserProject(v);
                      if (fieldErrors.project) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.project;
                          return newErrors;
                        });
                      }
                    }} disabled={projects.length === 0}>
                      <SelectTrigger id="project" className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.project ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder={projects.length === 0 ? "No projects available" : "Select project"} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length === 0 ? (
                          <SelectItem value="no-projects" disabled className="text-xs sm:text-sm text-muted-foreground">No projects available</SelectItem>
                        ) : (
                          projects.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()} className="text-xs sm:text-sm">{p.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.project && <p className="text-xs text-red-500">{fieldErrors.project}</p>}
                  </div>

                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="startDate" className="text-xs sm:text-sm font-medium">Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newUserStartDate}
                      onChange={(e) => {
                        setNewUserStartDate(e.target.value);
                        if (fieldErrors.startDate) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.startDate;
                            return newErrors;
                          });
                        }
                      }}
                      className={`h-9 sm:h-10 text-sm ${fieldErrors.startDate ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.startDate && <p className="text-xs text-red-500">{fieldErrors.startDate}</p>}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                    <Label htmlFor="responsibility" className="text-xs sm:text-sm">Responsibility Level <span className="text-red-500">*</span></Label>
                    <Select value={newUserResponsibility} onValueChange={setNewUserResponsibility}>
                      <SelectTrigger id="responsibility" className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL" className="text-xs sm:text-sm">Full</SelectItem>
                        <SelectItem value="PARTIAL" className="text-xs sm:text-sm">Partial</SelectItem>
                        <SelectItem value="ADVISORY" className="text-xs sm:text-sm">Advisory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto">
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign User to Project Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={(open) => { setIsAssignOpen(open); if (!open) resetAssignForm(); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Assign User to Project</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Assign this user to another project with a specific role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId} disabled={projects.length === 0}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={projects.length === 0 ? "No projects available" : "Select project"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="no-projects" disabled className="text-xs sm:text-sm text-muted-foreground">No projects available</SelectItem>
                  ) : (
                    projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()} className="text-xs sm:text-sm">{p.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Role</Label>
              <Select value={assignRole} onValueChange={setAssignRole}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER" className="text-xs sm:text-sm">Project Manager</SelectItem>
                  <SelectItem value="ACCOUNTANT" className="text-xs sm:text-sm">Project Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Start Date</Label>
              <Input type="date" value={assignStartDate} onChange={(e) => setAssignStartDate(e.target.value)} className="h-9 sm:h-10 text-sm" />
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Responsibility</Label>
              <Select value={assignResponsibility} onValueChange={setAssignResponsibility}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL" className="text-xs sm:text-sm">Full</SelectItem>
                  <SelectItem value="PARTIAL" className="text-xs sm:text-sm">Partial</SelectItem>
                  <SelectItem value="ADVISORY" className="text-xs sm:text-sm">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setIsAssignOpen(false); resetAssignForm(); }} className="h-9 text-xs sm:text-sm w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleAssignUser} disabled={!assignProjectId || !assignRole || !assignStartDate} className="h-9 text-xs sm:text-sm w-full sm:w-auto">
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetEditForm(); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update user details. Note: This will not affect their project assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Name <span className="text-red-500">*</span></Label>
              <Input
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                placeholder="John Doe"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                placeholder="john@example.com"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Phone Number</Label>
              <Input
                value={editUserPhone}
                onChange={(e) => setEditUserPhone(e.target.value)}
                placeholder="+255 xxx xxx xxx"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); resetEditForm(); }} className="h-9 text-xs sm:text-sm w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="h-9 text-xs sm:text-sm w-full sm:w-auto bg-[#2a3455] hover:bg-[#1e253e]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserConfirm} onOpenChange={(open) => !open && setDeleteUserConfirm(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Delete User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete <strong>{deleteUserConfirm?.userName}</strong>?
              This will remove them from all projects and deactivate their account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteUserConfirm(null)} className="h-9 text-xs sm:text-sm w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="h-9 text-xs sm:text-sm w-full sm:w-auto">Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove from Project Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Remove User from Project</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to remove <strong>{deleteConfirm?.userName}</strong> from <strong>{deleteConfirm?.projectName}</strong>?
              This will end their assignment but the user account will remain active for other projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="h-9 text-xs sm:text-sm w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveFromProject} className="h-9 text-xs sm:text-sm w-full sm:w-auto">Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ManageProjectUsers;
