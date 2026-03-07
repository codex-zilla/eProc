import type { Project } from '../../../types/models';
import { Building, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
    isSelected?: boolean;
}

export const ProjectCard = ({ project, onClick, isSelected }: ProjectCardProps) => {
    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col gap-3 rounded-lg border bg-white p-6 shadow-sm transition-all hover:border-[#2a3455] hover:shadow-md cursor-pointer ${isSelected ? 'border-[#2a3455] ring-2 ring-[#2a3455]/10' : 'border-slate-200'}`}
        >
            <div className="flex items-center justify-between">
                <div className={`rounded-full p-2.5 transition-colors ${isSelected
                    ? 'bg-[#2a3455] text-white'
                    : 'bg-[#2a3455]/10 text-[#2a3455] group-hover:bg-[#2a3455] group-hover:text-white'
                    }`}>
                    <Building className="h-5 w-5" />
                </div>
                <ArrowRight className={`h-5 w-5 transition-colors ${isSelected
                    ? 'text-[#2a3455]'
                    : 'text-slate-300 group-hover:text-[#2a3455]'
                    }`} />
            </div>
            <div>
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">{project.siteLocation || project.region || 'No location'}</p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${project.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {project.status}
                </span>
            </div>
        </div>
    );
};
