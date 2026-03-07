import type { Project, Site } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SiteCard } from '@/components/domain/projects/SiteCard';
import { EmptyState } from '@/components/common/EmptyState';
import { MapPin } from 'lucide-react';

interface ProjectSitesTabProps {
    project: Project;
    sites: Site[];
    isManager?: boolean;
}

export const ProjectSitesTab = ({ project, sites, isManager }: ProjectSitesTabProps) => {
    return (
        <Card className="flex flex-col shadow-none border-slate-200/50">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                    Active Sites
                </CardTitle>
                {isManager && (
                    <Button variant="link" asChild className="text-xs h-auto p-0 text-[#2a3455] font-semibold">
                        <a href={`/manager/projects/${project.id}/sites`}>Manage</a>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-0 flex-1">
                {sites.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            icon={MapPin}
                            title="No sites configured"
                            description="There are currently no active sites configured for this project."
                            action={isManager ? {
                                label: "Set up a new site",
                                onClick: () => window.location.href = `/manager/projects/${project.id}/sites`
                            } : undefined}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2 sm:px-4 py-2 pb-4">
                        {sites.map(site => (
                            <div key={site.id} className="min-w-0">
                                <SiteCard
                                    site={site}
                                    projectCurrency={project.currency}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
