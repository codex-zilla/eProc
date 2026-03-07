import { useState, useEffect } from 'react';
import type { Project, ProjectAssignment } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { projectService } from '@/services/projectService';
import { User } from 'lucide-react';
import { formatGPS, formatNumber } from '@/lib/formatters';
import { sortTeamMembers, formatRole } from '@/lib/team-utils';

interface ProjectOverviewTabProps {
    project: Project;
    onManageTeamClick?: () => void;
}

export const ProjectOverviewTab = ({ project, onManageTeamClick }: ProjectOverviewTabProps) => {
    const [team, setTeam] = useState<ProjectAssignment[]>([]);

    useEffect(() => {
        const loadTeam = async () => {
            if (project.id) {
                try {
                    const data = await projectService.getProjectTeam(project.id);
                    setTeam(data);
                } catch (e) {
                    console.error("Failed to load project team", e);
                }
            }
        };
        loadTeam();
    }, [project.id]);

    // Sort team without grouping using shared utility
    const sortedTeam = sortTeamMembers(team);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                {/* Project Brief */}
                <Card className="flex flex-col shadow-none border border-slate-200/50">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                            Project Brief
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 space-y-6 sm:space-y-8">
                        {project.description && (
                            <div>
                                <h4 className="text-slate-900 text-xs uppercase font-semibold">Description:</h4>
                                <p className="text-sm text-slate-600 leading-snug whitespace-pre-wrap">{project.description}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 leading-none mt-2">
                            <div>
                                <h4 className="text-slate-900 text-xs uppercase font-semibold">Rep Name:</h4>
                                <p className="font-semibold text-slate-600 text-xs sm:text-sm">{project.ownerRepName || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-900 text-xs uppercase font-semibold">Rep Contact:</h4>
                                <p className="font-semibold text-slate-600 text-xs sm:text-sm">{project.ownerRepContact || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-900 text-xs uppercase font-semibold">Budget:</h4>
                                <p className="font-semibold text-green-600 text-xs sm:text-sm">{project.currency || 'TZS'} {formatNumber(project.budgetTotal || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Context & Objectives */}
                <Card className="flex flex-col shadow-none border border-slate-200/50">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                            Context & Objectives
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-xs text-slate-900 uppercase">Key Objectives:</h4>
                            <p className="text-slate-600 text-sm leading-tight whitespace-pre-wrap">{project.keyObjectives || 'No objectives defined.'}</p>
                        </div>
                        <div className="h-px bg-slate-100 my-3" />
                        <div>
                            <h4 className="font-semibold text-xs text-slate-900 uppercase">Expected Output:</h4>
                            <p className="text-slate-600 text-sm leading-tight whitespace-pre-wrap">{project.expectedOutput || 'No output defined.'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Site Details */}
                <Card className="flex flex-col shadow-none border border-slate-200/50">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                            Site Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4 sm:gap-x-6">
                            <div>
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">Region:</h4>
                                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{project.region}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">District:</h4>
                                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{project.district}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">Ward:</h4>
                                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{project.ward}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">Plot Number:</h4>
                                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{project.plotNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">Title Deed:</h4>
                                <p className="font-semibold text-slate-700 text-xs sm:text-sm">{project.titleDeedAvailable ? 'Available' : 'Not Available'}</p>
                            </div>
                            <div className="col-span-2 mt-1">
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">Access Notes:</h4>
                                <p className="font-medium text-slate-800 text-sm max-w-lg leading-relaxed">{project.siteAccessNotes || 'None'}</p>
                            </div>
                            <div className="col-span-2 mt-1">
                                <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">GPS:</h4>
                                <div className="inline-flex">
                                    <code className="bg-slate-50 border border-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs text-slate-600 font-mono tracking-wide">
                                        {formatGPS(project.gpsCoordinates)}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">

                {/* Contract */}
                <Card className="flex flex-col shadow-none border border-slate-200/50">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                            Contract
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600">Type</span>
                                <span className="font-semibold text-slate-700">{project.contractType?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600">Perf. Security</span>
                                <span className="font-semibold text-slate-700">{project.performanceSecurityRequired ? 'Required' : 'Not Required'}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600">Defects Period</span>
                                <span className="font-semibold text-slate-700">{project.defectsLiabilityPeriod || 0} Months</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600">Start Date</span>
                                <span className="font-semibold text-slate-700">{project.startDate || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600">
                                    {project.status === 'COMPLETED' ? 'Completed' : project.status === 'CANCELLED' ? 'Cancelled' : 'Due'}
                                </span>
                                <span className="font-semibold text-slate-700">
                                    {project.status !== 'ACTIVE' ? (project.endDate || 'N/A') : (project.expectedCompletionDate || 'N/A')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Summary */}
                <Card className="flex flex-col shadow-none border border-slate-200/50">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                            Team Summary
                        </CardTitle>
                        {onManageTeamClick && (
                            <Button
                                variant="link"
                                className="text-xs h-auto p-0 text-[#2a3455] font-semibold"
                                onClick={onManageTeamClick}
                            >
                                Manage
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                        {sortedTeam.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 h-full text-center">
                                <div className="text-3xl font-bold tracking-tight text-slate-200 mb-1">{project.teamCount || 0}</div>
                                <span className="text-xs text-slate-500">Members</span>
                            </div>
                        ) : (
                            <div className="space-y-2 py-1">
                                {sortedTeam.map(member => (
                                    <div key={member.id} className="flex items-start gap-3">
                                        <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-full shrink-0 mt-0.5">
                                            <User className="h-4 w-4 text-[#1e256e]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{member.userName}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{member.userEmail || 'No email provided'}</p>
                                            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#1e256e]">{formatRole(member.role)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
