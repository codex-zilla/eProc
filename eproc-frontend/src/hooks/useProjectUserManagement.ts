import { useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useProjects } from '@/hooks/queries/useProjects';
import {
  useMyProjectUsers,
  useCreateProjectUser,
  useAssignUserToProject,
  useRemoveUserFromProject,
  useUpdateUser,
  useDeleteUser
} from '@/hooks/queries/useProjectUsers';

export interface ProjectUser {
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

export const useProjectUserManagement = () => {
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

    if (newUserPhone && newUserPhone.trim().length > 0) {
      const sanitizedPhone = newUserPhone.replace(/[^\d+]/g, '');
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        errors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
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
      phoneNumber: newUserPhone && newUserPhone.trim().length > 0 ? newUserPhone.replace(/[^\d+]/g, '') : undefined,
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

    if (editUserPhone && editUserPhone.trim().length > 0) {
      const sanitizedPhone = editUserPhone.replace(/[^\d+]/g, '');
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        handleError(new Error('Please enter a valid phone number (10-15 digits)'), 'Validation Error');
        return;
      }
    }

    updateUserMutation.mutate({
      userId: editUserId,
      data: {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phoneNumber: editUserPhone && editUserPhone.trim().length > 0 ? editUserPhone.replace(/[^\d+]/g, '') : undefined
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

  return {
    // Data
    projects,
    filteredUsers,
    loading,
    error,
    
    // UI State
    searchTerm,
    setSearchTerm,
    expandedUserId,
    setExpandedUserId,
    fieldErrors,
    setFieldErrors,
    createSuccess,
    
    // Dialog states
    isAssignOpen,
    setIsAssignOpen,
    isEditOpen,
    setIsEditOpen,
    deleteUserConfirm,
    setDeleteUserConfirm,
    deleteConfirm,
    setDeleteConfirm,

    // Form states
    assignProjectId, setAssignProjectId,
    assignRole, setAssignRole,
    assignStartDate, setAssignStartDate,
    assignResponsibility, setAssignResponsibility,
    newUserName, setNewUserName,
    newUserEmail, setNewUserEmail,
    newUserRole, setNewUserRole,
    newUserProject, setNewUserProject,
    newUserPhone, setNewUserPhone,
    newUserStartDate, setNewUserStartDate,
    newUserResponsibility, setNewUserResponsibility,
    editUserName, setEditUserName,
    editUserEmail, setEditUserEmail,
    editUserPhone, setEditUserPhone,

    // Handlers
    handleCreateUser,
    handleAssignUser,
    handleRemoveFromProject,
    handleEditUser,
    handleDeleteUser,
    openAssignDialog,
    openEditDialog,
    resetAssignForm,
    resetEditForm
  };
};
