import { RequestList } from '@/components/domain/requests/RequestList';

/**
 * Requests page - Comprehensive request management for Engineers.
 * Displays all requests for projects the engineer is assigned to.
 * Uses shared RequestList component.
 */
const Requests = () => {
  return <RequestList role="ENGINEER" />;
};

export default Requests;
