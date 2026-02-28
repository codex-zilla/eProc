import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Site } from '@/types/models';
import { Plus, MapPin } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { SiteCard } from '@/components/domain/projects/SiteCard';
import { SiteFormModal } from '@/components/domain/projects/SiteFormModal';
import { useProject } from '@/hooks/queries/useProjects';
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from '@/hooks/queries/useSites';
import { toast } from 'sonner';

const ManageSites = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : 0;

    // Data Fetching
    const { data: project, isLoading: loadingProject, error: projectError, refetch: refetchProject } = useProject(projectId);
    const { data: sites = [], isLoading: loadingSites } = useSites(projectId);

    // Mutations
    const createSiteMutation = useCreateSite();
    const updateSiteMutation = useUpdateSite();
    const deleteSiteMutation = useDeleteSite();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);

    const handleOpenModal = (site?: Site) => {
        setEditingSite(site || null);
        setIsModalOpen(true);
    };

    const handleSave = (payload: Parameters<typeof createSiteMutation.mutate>[0]) => {
        if (editingSite) {
            updateSiteMutation.mutate(
                { id: editingSite.id, data: payload },
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                        toast.success("Site updated successfully");
                    }
                }
            );
        } else {
            createSiteMutation.mutate(
                payload,
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                        toast.success("Site created successfully");
                    }
                }
            );
        }
    };

    const handleDelete = (siteId: number) => {
        if (!confirm('Are you sure you want to delete this site?')) return;
        deleteSiteMutation.mutate(siteId);
    };

    const isLoading = loadingProject || loadingSites;
    const isSaving = createSiteMutation.isPending || updateSiteMutation.isPending;

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner size="lg" text="Loading..." />
        </div>
    );

    if (projectError) return (
        <ErrorDisplay
            error={projectError}
            onRetry={() => refetchProject()}
            title="Failed to load project details"
        />
    );

    if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

    const headerDescription = (
        <div className="flex items-center text-xs sm:text-sm text-slate-500 mt-1">
            <span className="font-medium text-[#2a3455] truncate">{project.name}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span className="font-mono tracking-wide bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm text-[11px] font-semibold text-slate-600 uppercase pt-[3px]">{project.code || 'NO-CODE'}</span>
        </div>
    );

    return (
        <div className="space-y-3 sm:space-y-6 max-w-7xl mx-auto pb-6 sm:pb-10">
            <PageHeader
                title="Manage Sites"
                description={headerDescription}
                className="mb-8"
            />

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sites.map(site => (
                    <div key={site.id} className="min-w-0">
                        <SiteCard
                            site={site}
                            projectCurrency={project.currency}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}

                {/* Add Another Site Card */}
                <button
                    onClick={() => handleOpenModal()}
                    className="h-full min-h-[280px] flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-slate-200 rounded-[20px] p-6 text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1e256e]/5 transition-colors relative">
                        <MapPin className="w-[22px] h-[22px] text-slate-400 group-hover:text-[#1e256e] transition-colors" />
                        <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-white rounded-full p-0.5">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#1e256e] transition-colors" />
                        </div>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#2a3455] mb-2">Add Another Site</h3>
                    <p className="text-[13px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">Expand your project reach by registering a new operational site.</p>
                </button>
            </div>

            {/* Edit/Create Modal */}
            <SiteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingSite={editingSite}
                project={project}
                saving={isSaving}
            />
        </div>
    );
};

export default ManageSites;
