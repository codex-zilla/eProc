interface RequestStatusBadgeProps {
  status: string;
}

/**
 * Reusable badge component for request status.
 */
const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  const getClass = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
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

export default RequestStatusBadge;
