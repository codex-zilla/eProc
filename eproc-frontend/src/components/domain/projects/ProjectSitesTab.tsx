import type { Project, Site } from '@/types/models';
import { Button } from '@/components/ui/button';
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
        <div className="mt-4 sm:mt-6 bg-white/50 rounded-xl">
            <div className="flex flex-row justify-between items-center gap-3 mb-4 px-4 pt-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#2a3455] border-s-4 border-[#2a3455] ps-2">Active Sites</h3>
                {isManager && (
                    <Button size="sm" asChild className="bg-[#2a3455] hover:bg-[#1e256e] text-white shadow-sm rounded-lg h-8 px-4 text-xs font-medium">
                        <a href={`/manager/projects/${project.id}/sites`}>Manage</a>
                    </Button>
                )}
            </div>

            <div className="px-1.5">
                {sites.length === 0 ? (
                    <EmptyState
                        icon={MapPin}
                        title="No sites configured"
                        description="There are currently no active sites configured for this project."
                        action={isManager ? {
                            label: "Set up a new site",
                            onClick: () => window.location.href = `/manager/projects/${project.id}/sites`
                        } : undefined}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            </div>
        </div>
    );
};
