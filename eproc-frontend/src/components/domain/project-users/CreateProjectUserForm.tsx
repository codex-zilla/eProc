import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { FormField } from '@/components/common/FormField';
import { useProjectUserManagement } from '@/hooks/useProjectUserManagement';

export const CreateProjectUserForm = (props: ReturnType<typeof useProjectUserManagement>) => {
    const {
        createSuccess, handleCreateUser, fieldErrors,
        newUserName, setNewUserName,
        newUserEmail, setNewUserEmail,
        newUserRole, setNewUserRole,
        newUserProject, setNewUserProject,
        newUserPhone, setNewUserPhone,
        newUserStartDate, setNewUserStartDate,
        newUserResponsibility, setNewUserResponsibility,
        projects
    } = props;

    return (
        <Card className="border-slate-100 shadow-none bg-white/70">
            <CardHeader className="p-3 sm:p-4">
                <CardDescription className="text-xs sm:text-sm leading-tight text-slate-800">
                    Create a new <span className="font-semibold">MANAGER</span> or <span className="font-semibold">ACCOUNTANT</span> user with a default password of <span className="font-semibold">123456</span>.
                    The user will be required to change their password on first login.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 sm:pt-2">
                {createSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
                        User created successfully! They can now log in with password:123456
                    </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField label="Name" required error={fieldErrors.name} htmlFor="name">
                            <Input
                                id="name"
                                value={newUserName}
                                onChange={(e) => {
                                    setNewUserName(e.target.value);
                                    if (fieldErrors.name) {
                                        props.setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.name;
                                            return newErrors;
                                        });
                                    }
                                }}
                                placeholder="John Doe"
                                className={`h-9 sm:h-10 text-sm ${fieldErrors.name ? 'border-red-500' : ''}`}
                            />
                        </FormField>

                        <FormField label="Email" required error={fieldErrors.email} htmlFor="email">
                            <Input
                                id="email"
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => {
                                    setNewUserEmail(e.target.value);
                                    if (fieldErrors.email) {
                                        props.setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.email;
                                            return newErrors;
                                        });
                                    }
                                }}
                                placeholder="john@example.com"
                                className={`h-9 sm:h-10 text-sm ${fieldErrors.email ? 'border-red-500' : ''}`}
                            />
                        </FormField>

                        <FormField label="Project Role" required error={fieldErrors.role} htmlFor="role">
                            <Select value={newUserRole} onValueChange={(v) => {
                                setNewUserRole(v);
                                if (fieldErrors.role) {
                                    props.setFieldErrors(prev => {
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
                        </FormField>

                        <FormField label="Phone Number" error={fieldErrors.phone} htmlFor="phone">
                            <Input
                                id="phone"
                                value={newUserPhone}
                                onChange={(e) => {
                                    setNewUserPhone(e.target.value.replace(/[^\d+\s-]/g, ''));
                                    if (fieldErrors.phone) {
                                        props.setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.phone;
                                            return newErrors;
                                        });
                                    }
                                }}
                                placeholder="+255 xxx xxx xxx"
                                className={`h-9 sm:h-10 text-sm ${fieldErrors.phone ? 'border-red-500' : ''}`}
                            />
                        </FormField>

                        <FormField label="Assign to Project" required error={fieldErrors.project} htmlFor="project">
                            <Select value={newUserProject} onValueChange={(v) => {
                                setNewUserProject(v);
                                if (fieldErrors.project) {
                                    props.setFieldErrors(prev => {
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
                        </FormField>

                        <FormField label="Start Date" required error={fieldErrors.startDate} htmlFor="startDate">
                            <Input
                                id="startDate"
                                type="date"
                                value={newUserStartDate}
                                onChange={(e) => {
                                    setNewUserStartDate(e.target.value);
                                    if (fieldErrors.startDate) {
                                        props.setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.startDate;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={`h-9 sm:h-10 text-sm ${fieldErrors.startDate ? 'border-red-500' : ''}`}
                            />
                        </FormField>

                        <FormField label="Responsibility Level" required className="sm:col-span-2" htmlFor="responsibility">
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
                        </FormField>
                    </div>

                    <div className="flex justify-end pt-2 sm:pt-3">
                        <Button type="submit" className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto">
                            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Create User
                        </Button>
                    </div>
                </form>
            </CardContent >
        </Card >
    );
};
