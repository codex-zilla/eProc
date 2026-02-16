import { RequestList } from '@/components/domain/requests/RequestList';

/**
 * Requests page - Comprehensive request management for Project Owner.
 * Displays all requests for projects the manager owns.
 * Uses shared RequestList component.
 */
const Requests = () => {
  return <RequestList role="MANAGER" />;
};

export default Requests;
