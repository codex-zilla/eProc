import { useState, useEffect } from 'react';
import type { Project, ProjectAssignment } from '@/types/models';
import { Button } from '@/components/ui/button';
import { projectService } from '@/services/projectService';
import { User } from 'lucide-react';
import { formatGPS } from '@/lib/formatters';
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

                {/* Context & Objectives */}
                <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 relative">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] mb-3 border-s-4 border-[#2a3455] ps-2">Context & Objectives</h3>
                    <div className="space-y-2 sm:space-y-2 px-1.5">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-700">Key Objectives</h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{project.keyObjectives || 'No objectives defined.'}</p>
                        </div>
                        <div className="h-px bg-slate-100 my-2 sm:my-2" />
                        <div>
                            <h4 className="font-semibold text-sm text-slate-700">Expected Output</h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{project.expectedOutput || 'No output defined.'}</p>
                        </div>
                    </div>
                </div>

                {/* Site Details */}
                <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] mb-3 border-s-4 border-[#2a3455] ps-2">Site Details</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-y-2 sm:gap-y-3 px-1.5 gap-x-4 sm:gap-x-6">
                        <div>
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">Region</span>
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">{project.region}</span>
                        </div>
                        <div>
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">District</span>
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">{project.district}</span>
                        </div>
                        <div>
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">Ward</span>
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">{project.ward}</span>
                        </div>
                        <div>
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">Plot Number</span>
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">{project.plotNumber || 'N/A'}</span>
                        </div>
                        <div className="col-span-2 mt-1">
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">Access Notes</span>
                            <p className="font-medium text-slate-800 text-sm max-w-lg leading-relaxed">{project.siteAccessNotes || 'None'}</p>
                        </div>
                        <div className="col-span-2 mt-1">
                            <span className="text-slate-700 block text-[10px] uppercase tracking-widest font-medium">GPS</span>
                            <div className="inline-flex">
                                <code className="bg-slate-50 border border-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs text-slate-600 font-mono tracking-wide">
                                    {formatGPS(project.gpsCoordinates)}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">

                {/* Contract */}
                <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] mb-3 border-s-4 border-[#2a3455] ps-2">Contract</h3>
                    <div className="space-y-3 text-sm px-1.5">
                        <div className="flex justify-between items-center group">
                            <span className="text-slate-600">Type</span>
                            <span className="font-semibold text-slate-700">{project.contractType?.replace(/_/g, ' ') || 'N/A'}</span>
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
                </div>

                {/* Team Summary */}
                <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] border-s-4 border-[#2a3455] ps-2">Team Summary</h3>
                        {onManageTeamClick && (
                            <Button
                                variant="link"
                                className="text-xs font-medium h-auto p-0 text-[#1e256e] hover:text-[#2a3455]"
                                onClick={onManageTeamClick}
                            >
                                Manage
                            </Button>
                        )}
                    </div>

                    <div>
                        {sortedTeam.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 h-full text-center">
                                <div className="text-3xl font-bold tracking-tight text-slate-200 mb-1">{project.teamCount || 0}</div>
                                <span className="text-xs text-slate-500">Members</span>
                            </div>
                        ) : (
                            <div className="space-y-4 py-1">
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
                    </div>
                </div>
            </div>
        </div>
    );
};
