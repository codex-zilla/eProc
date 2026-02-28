import { useNavigate, Link } from 'react-router-dom';
import { ProjectList } from '@/components/domain/projects/ProjectList';
import { PageHeader } from '@/components/common/PageHeader';
import { Plus, FolderOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/queries/useProjects';
import { type ColumnDef } from '@/components/common/DataTable';
import { type Project } from '@/types/models';
import { formatNumber, formatDate } from '@/lib/formatters';
import ProjectStatusBadge from '@/components/domain/ProjectStatusBadge';

/**
 * Manager-specific column definitions.
 * - No "Owner" column (all projects belong to the same manager).
 * - Includes "Team" column showing the number of team members.
 */
const managerProjectColumns: ColumnDef<Project>[] = [
  {
    header: 'Project Name',
    cell: (project) => (
      <span className="text-[#2a3455] font-semibold">{project.name}</span>
    ),
    className: 'min-w-[200px]',
  },
  {
    header: 'Budget',
    cell: (project) => (
      <span className="font-mono text-slate-900">
        {project.currency} {formatNumber(project.budgetTotal || 0)}
      </span>
    ),
    className: 'font-medium',
  },
  {
    header: 'Team',
    cell: (project) => (
      <div className="flex items-center gap-1.5 text-slate-600">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        <span>{project.teamCount ?? 0} members</span>
      </div>
    ),
    className: 'hidden md:table-cell',
  },
  {
    header: 'Created Date',
    cell: (project) => formatDate(project.createdAt, 'short'),
    className: 'text-slate-600 hidden md:table-cell',
  },
  {
    header: 'Status',
    cell: (project) => <ProjectStatusBadge status={project.status as any} />,
    className: 'text-right',
  },
];

/**
 * Manager Projects page – lists all projects the manager can manage.
 * Uses the shared ProjectList with manager-specific columns, row navigation
 * and empty state action. No conditionals needed inside ProjectList.
 */
const ManagerProjects = () => {
  const navigate = useNavigate();
  // Pre-warm the query cache so ProjectList renders instantly.
  useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#2a3455]" />
            My Projects
          </div>
        }
        description="Manage and monitor all projects under your supervision."
        actions={
          <Button
            asChild
            className="bg-[#2a3455] text-white hover:bg-[#1e253e] whitespace-nowrap"
          >
            <Link to="/manager/projects/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Project
            </Link>
          </Button>
        }
      />
      <ProjectList
        columns={managerProjectColumns}
        onRowClick={(project) => navigate(`/manager/projects/${project.id}`)}
        emptyStateAction={
          <Button asChild className="mt-4 bg-[#2a3455] hover:bg-[#1e253e] text-white">
            <Link to="/manager/projects/new">Create Project</Link>
          </Button>
        }
      />
    </div>
  );
};

export default ManagerProjects;
