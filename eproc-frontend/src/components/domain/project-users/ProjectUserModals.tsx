import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericModal } from '@/components/common/GenericModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useProjectUserManagement } from '@/hooks/useProjectUserManagement';

export const ProjectUserModals = (props: ReturnType<typeof useProjectUserManagement>) => {
    const {
        isAssignOpen, setIsAssignOpen, resetAssignForm,
        projects, assignProjectId, setAssignProjectId,
        assignRole, setAssignRole,
        assignStartDate, setAssignStartDate,
        assignResponsibility, setAssignResponsibility,
        handleAssignUser,

        isEditOpen, setIsEditOpen, resetEditForm,
        editUserName, setEditUserName,
        editUserEmail, setEditUserEmail,
        editUserPhone, setEditUserPhone,
        handleEditUser,

        deleteUserConfirm, setDeleteUserConfirm, handleDeleteUser,
        deleteConfirm, setDeleteConfirm, handleRemoveFromProject
    } = props;

    return (
        <>
            <GenericModal
                isOpen={isAssignOpen}
                onClose={(open) => { setIsAssignOpen(open); if (!open) resetAssignForm(); }}
                title="Assign User to Project"
                description="Assign this user to another project with a specific role."
                footer={
                    <Button onClick={handleAssignUser} disabled={!assignProjectId || !assignRole || !assignStartDate} className="h-9 text-xs sm:text-sm w-full sm:w-auto bg-[#2a3455] hover:bg-[#1e256e]">
                        Assign
                    </Button>
                }
            >
                <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Project</Label>
                        <Select value={assignProjectId} onValueChange={setAssignProjectId} disabled={projects.length === 0}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/60">
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
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/60"><SelectValue placeholder="Select role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MANAGER" className="text-xs sm:text-sm">Project Manager</SelectItem>
                                <SelectItem value="ACCOUNTANT" className="text-xs sm:text-sm">Project Accountant</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Start Date</Label>
                        <Input type="date" value={assignStartDate} onChange={(e) => setAssignStartDate(e.target.value)} className="h-9 sm:h-10 text-sm border-[#2a3455]/60" />
                    </div>
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Responsibility</Label>
                        <Select value={assignResponsibility} onValueChange={setAssignResponsibility}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/60"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FULL" className="text-xs sm:text-sm">Full</SelectItem>
                                <SelectItem value="PARTIAL" className="text-xs sm:text-sm">Partial</SelectItem>
                                <SelectItem value="ADVISORY" className="text-xs sm:text-sm">Advisory</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </GenericModal>

            <GenericModal
                isOpen={isEditOpen}
                onClose={(open) => { setIsEditOpen(open); if (!open) resetEditForm(); }}
                title="Edit User"
                description="Update user details. Note: This will not affect their project assignments."
                footer={
                    <Button onClick={handleEditUser} className="h-9 text-xs sm:text-sm w-full sm:w-auto bg-[#2a3455] hover:bg-[#1e256e]">
                        Save Changes
                    </Button>
                }
            >
                <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Name <span className="text-red-500">*</span></Label>
                        <Input value={editUserName} onChange={(e) => setEditUserName(e.target.value)} placeholder="John Doe" className="h-9 sm:h-10 text-sm border-[#2a3455]/60" />
                    </div>
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Email <span className="text-red-500">*</span></Label>
                        <Input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} placeholder="john@example.com" className="h-9 sm:h-10 text-sm border-[#2a3455]/60" />
                    </div>
                    <div className="grid gap-1.5 sm:gap-2">
                        <Label className="text-xs sm:text-sm">Phone Number</Label>
                        <Input value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} placeholder="+255 xxx xxx xxx" className="h-9 sm:h-10 text-sm border-[#2a3455]/60" />
                    </div>
                </div>
            </GenericModal>

            <ConfirmModal
                isOpen={!!deleteUserConfirm}
                onClose={() => setDeleteUserConfirm(null)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                description={
                    <>
                        Are you sure you want to delete <strong>{deleteUserConfirm?.userName}</strong>?
                        This will remove them from all projects and deactivate their account. This action cannot be undone.
                    </>
                }
                confirmLabel="Delete User"
                confirmVariant="destructive"
            />

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleRemoveFromProject}
                title="Remove User from Project"
                description={
                    <>
                        Are you sure you want to remove <strong>{deleteConfirm?.userName}</strong> from <strong>{deleteConfirm?.projectName}</strong>?
                        This will end their assignment but the user account will remain active for other projects.
                    </>
                }
                confirmLabel="Remove"
                confirmVariant="destructive"
            />
        </>
    );
};
