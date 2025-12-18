import { useState, useMemo } from 'react';
import type { MaterialRequest, RequestStatus } from '../types/models';

interface RequestListProps {
  requests: MaterialRequest[];
  currentUserEmail?: string;
  onRequestClick?: (request: MaterialRequest) => void;
}

export default function RequestList({ requests, currentUserEmail, onRequestClick }: RequestListProps) {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [myRequestsOnly, setMyRequestsOnly] = useState(false);

  const filteredRequests = useMemo(() => {
    let result = requests;

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (myRequestsOnly && currentUserEmail) {
      result = result.filter((r) => r.requestedByEmail === currentUserEmail);
    }

    // Sort by date (newest first)
    return [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests, statusFilter, myRequestsOnly, currentUserEmail]);

  const getMaterialName = (request: MaterialRequest): string => {
    return request.materialName || request.manualMaterialName || 'Unknown';
  };

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#dc2626';
      case 'PENDING':
      default:
        return '#f59e0b';
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: requests.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    requests.forEach((r) => {
      counts[r.status]++;
    });
    return counts;
  }, [requests]);

  return (
    <div className="request-list">
      {/* Filters */}
      <div className="list-filters">
        <div className="status-tabs">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              className={`tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
        {currentUserEmail && (
          <label className="my-requests-toggle">
            <input
              type="checkbox"
              checked={myRequestsOnly}
              onChange={(e) => setMyRequestsOnly(e.target.checked)}
            />
            My Requests Only
          </label>
        )}
      </div>

      {/* Request items */}
      {filteredRequests.length === 0 ? (
        <p className="empty-state">No requests found.</p>
      ) : (
        <div className="request-items">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`request-item ${request.status === 'REJECTED' ? 'rejected' : ''}`}
              onClick={() => onRequestClick?.(request)}
            >
              <div className="item-header">
                <span className="request-id">#{request.id}</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {request.status}
                </span>
              </div>
              <div className="item-body">
                <p className="material-name">{getMaterialName(request)}</p>
                <p className="details">
                  {request.quantity} units • {request.siteName}
                </p>
                <p className="dates">
                  {new Date(request.plannedUsageStart).toLocaleDateString()} -{' '}
                  {new Date(request.plannedUsageEnd).toLocaleDateString()}
                </p>
              </div>
              {request.status === 'REJECTED' && request.rejectionComment && (
                <div className="rejection-info">
                  <strong>Rejection Reason:</strong> {request.rejectionComment}
                </div>
              )}
              {request.emergencyFlag && (
                <span className="emergency-indicator">⚠️ Emergency</span>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .request-list {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .list-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .status-tabs {
          display: flex;
          gap: 0.25rem;
        }
        .tab {
          padding: 0.5rem 1rem;
          border: none;
          background: #f3f4f6;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .tab:first-child {
          border-radius: 6px 0 0 6px;
        }
        .tab:last-child {
          border-radius: 0 6px 6px 0;
        }
        .tab.active {
          background: #6366f1;
          color: white;
        }
        .my-requests-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
        .request-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .request-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .request-item:hover {
          border-color: #6366f1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .request-item.rejected {
          background: #fef2f2;
          border-color: #fecaca;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .request-id {
          font-weight: 600;
          color: #6b7280;
        }
        .status-badge {
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .material-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .details, .dates {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .rejection-info {
          margin-top: 0.75rem;
          padding: 0.5rem;
          background: #fee2e2;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #991b1b;
        }
        .emergency-indicator {
          position: absolute;
          top: 0.5rem;
          right: 4rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
