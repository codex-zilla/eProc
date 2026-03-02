import type { Project } from '@/types/models';
import { Card, CardContent } from '@/components/ui/card';
import { User, MapPin, Calendar } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';

interface ProjectQuickStatsProps {
    project: Project;
}

export const ProjectQuickStats = ({ project }: ProjectQuickStatsProps) => {
    console.log("Project end date: ", project.endDate);

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardContent className="py-4 px-6 md:py-5 md:px-8">
                <div className="flex flex-col gap-4">
                    {/* Top Row Stats */}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-500">Owner Rep:</span>
                            <span className="font-semibold text-slate-900">{project.ownerRepName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-500">Location:</span>
                            <span className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-none">{project.region}, {project.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-500">Start Date:</span>
                            <span className="font-semibold text-slate-900">{project.startDate || 'TBD'}</span>
                        </div>
                        {project.endDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-slate-500">End Date:</span>
                                <span className="font-semibold text-slate-900">{project.endDate}</span>
                            </div>
                        )}
                    </div>
                    {/* Bottom Row Stats */}
                    <div className="flex items-center gap-2 text-sm pt-1">
                        <span className="text-slate-500">Budget:</span>
                        <span className="font-semibold text-green-700">{project.currency} {formatNumber(project.budgetTotal || 0)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
