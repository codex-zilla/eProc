import { RequestList } from '@/components/domain/requests/RequestList';
import { PageHeader } from '@/components/common/PageHeader';
import { ClipboardList } from 'lucide-react';

/**
 * Requests page - Comprehensive request management for Project Owner.
 * Displays all requests for projects the manager owns.
 * Uses shared RequestList component.
 */
const Requests = () => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#2a3455]" />
            Request Management
          </div>
        }
        description="Monitor and manage material requests across your projects."
      />
      <RequestList />
    </div>
  );
};

export default Requests;
