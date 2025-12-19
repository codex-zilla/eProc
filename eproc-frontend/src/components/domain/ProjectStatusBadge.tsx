interface ProjectStatusBadgeProps {
  status: string;
}

/**
 * Reusable badge component for project status.
 */
const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const getClass = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${getClass()}`}>
      {status}
    </span>
  );
};

export default ProjectStatusBadge;
