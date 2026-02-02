import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectWizard from '@/components/ProjectWizard';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/models';

const EditProject = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                // Fetch project details
                // Note: We might need to fetch sites separately if not included in getProjectById
                const data = await projectService.getProjectById(parseInt(id));
                setProject(data);
            } catch (err: any) {
                console.error('Failed to load project:', err);
                setError(err.response?.data?.message || 'Failed to load project details');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">Loading project details...</div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-red-500">{error || 'Project not found'}</div>
                <button 
                    onClick={() => navigate('/manager/projects')}
                    className="text-indigo-600 hover:underline"
                >
                    Return to My Projects
                </button>
            </div>
        );
    }

    return (
        <ProjectWizard 
            initialData={project} 
            isEditMode={true} 
        />
    );
};

export default EditProject;
