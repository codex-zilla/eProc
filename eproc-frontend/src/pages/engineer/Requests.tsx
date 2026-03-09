import { RequestList } from '@/components/domain/requests/RequestList';
import { PageHeader } from '@/components/common/PageHeader';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Requests page - Comprehensive request management for Engineers.
 * Displays all requests for projects the engineer is assigned to.
 * Uses shared RequestList component.
 */
const Requests = () => {
  const createRequestAction = (
    <Button asChild className="bg-[#2a3455] text-white hover:bg-[#1e253e] whitespace-nowrap h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
      <Link to="/engineer/requests/new" className="flex items-center gap-1.5 sm:gap-2">
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Create New Request</span>
        <span className="sm:hidden">New Request</span>
      </Link>
    </Button>
  );

  return (
    <div className="space-y-2 sm:space-y-3">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#2a3455]" />
            My Requests
          </div>
        }
        description="View and manage material requests for your assigned projects."
        actions={createRequestAction}
      />
      <RequestList
        emptyStateAction={
          <Button asChild className="mt-4 bg-[#2a3455] hover:bg-[#1e253e] text-white">
            <Link to="/engineer/requests/new">Create Request</Link>
          </Button>
        }
      />
    </div>
  );
};

export default Requests;
