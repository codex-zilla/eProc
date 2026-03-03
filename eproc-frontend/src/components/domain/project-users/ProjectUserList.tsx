import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, User, Trash2, Building, ChevronDown, ChevronUp, Edit, UserX } from 'lucide-react';
import { useProjectUserManagement } from '@/hooks/useProjectUserManagement';

export const ProjectUserList = (props: ReturnType<typeof useProjectUserManagement>) => {
    const {
        filteredUsers, expandedUserId, setExpandedUserId,
        openEditDialog, openAssignDialog, setDeleteUserConfirm, setDeleteConfirm
    } = props;

    return (
        <div className="space-y-2">
            {filteredUsers.map((user) => (
                <div key={user.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div
                        className="flex flex-row items-start sm:items-center justify-between p-2 sm:p-4 hover:bg-slate-50 transition-colors gap-3 cursor-pointer"
                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                    >
                        <div className="flex items-start sm:items-center gap-2 flex-1 w-full">
                            <div className="bg-[#2a3455]/10 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#2a3455]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-row sm:items-center gap-1">
                                    <span className="font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">{user.name}</span>
                                    <Badge
                                        variant={user.activeProjectCount > 0 ? 'default' : 'secondary'}
                                        className={`text-[10px] sm:text-xs w-fit whitespace-nowrap ${user.activeProjectCount > 0 ? 'bg-[#2a3455] hover:bg-[#1e253e]' : ''}`}
                                    >
                                        <span className="hidden sm:inline">{user.activeProjectCount > 0 ? `Active (${user.activeProjectCount} project${user.activeProjectCount > 1 ? 's' : ''})` : 'Inactive'}</span>
                                        <span className="sm:hidden">{user.activeProjectCount > 0 ? `Active (${user.activeProjectCount})` : 'Inactive'}</span>
                                    </Badge>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 break-words">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-1 sm:gap-2 w-full sm:w-auto flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openEditDialog(user); }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-8 text-xs sm:text-sm px-2 sm:px-3 z-10 relative"
                                title="Edit User"
                            >
                                <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openAssignDialog(user.id); }}
                                className="text-[#2a3455] hover:text-[#1e253e] hover:bg-[#2a3455]/10 border-[#2a3455]/30 h-8 text-xs sm:text-sm px-2 sm:px-3 z-10 relative"
                                title="Assign to Project"
                            >
                                <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline ml-1">Assign</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setDeleteUserConfirm({ userId: user.id, userName: user.name }); }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 text-xs sm:text-sm px-2 sm:px-3 z-10 relative"
                                title="Delete User Permanently"
                            >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setExpandedUserId(expandedUserId === user.id ? null : user.id); }}
                                className="hidden sm:inline-flex h-8 w-8 p-0 z-10 relative"
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
                            <div className="text-xs sm:text-sm font-semibold text-slate-700">Project Assignments:</div>
                            <div className="space-y-2">
                                {user.projects.map((project) => (
                                    <div key={project.id} className="flex flex-row items-start sm:items-center justify-between p-2 sm:p-3 gap-1.5">
                                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-[#2a3455] text-xs sm:text-sm truncate">{project.projectName}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-500">
                                                    <span className="">{project.role.replace('PROJECT_', '')}</span>
                                                    <span className=""> • </span>
                                                    <span className="">{project.responsibilityLevel}</span>
                                                    <span className=""> • </span>
                                                    <span className="">Since {project.startDate}</span>
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
    );
};
