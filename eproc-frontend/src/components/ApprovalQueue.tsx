import { useState } from 'react';
import type { MaterialRequest } from '../types/models';
import { requestService } from '../services/requestService';

interface ApprovalQueueProps {
  requests: MaterialRequest[];
  onRequestUpdated?: () => void;
}

export default function ApprovalQueue({ requests, onRequestUpdated }: ApprovalQueueProps) {
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (request: MaterialRequest) => {
    setIsProcessing(true);
    setError(null);
    try {
      await requestService.approveRequest(request.id);
      onRequestUpdated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionComment.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      await requestService.rejectRequest(selectedRequest.id, rejectionComment);
      setSelectedRequest(null);
      setRejectionComment('');
      onRequestUpdated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const isUrgent = (request: MaterialRequest): boolean => {
    return request.emergencyFlag;
  };

  const isDueSoon = (request: MaterialRequest): boolean => {
    const start = new Date(request.plannedUsageStart);
    const now = new Date();
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilStart <= 3 && daysUntilStart >= 0;
  };

  const sortedRequests = [...requests].sort((a, b) => {
    // Emergency first
    if (a.emergencyFlag !== b.emergencyFlag) return a.emergencyFlag ? -1 : 1;
    // Then by planned usage start
    return new Date(a.plannedUsageStart).getTime() - new Date(b.plannedUsageStart).getTime();
  });

  const getMaterialName = (request: MaterialRequest): string => {
    return request.materialName || request.manualMaterialName || 'Unknown';
  };

  return (
    <div className="approval-queue">
      <h3>Pending Approvals ({requests.length})</h3>
      
      {error && <div className="error-message">{error}</div>}

      {sortedRequests.length === 0 ? (
        <p className="empty-state">No pending requests to review.</p>
      ) : (
        <div className="request-list">
          {sortedRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <span className="request-id">#{request.id}</span>
                <div className="badges">
                  {isUrgent(request) && <span className="badge emergency">⚠️ EMERGENCY</span>}
                  {isDueSoon(request) && <span className="badge due-soon">🕒 Due Soon</span>}
                </div>
              </div>
              
              <div className="request-body">
                <p className="material-name">{getMaterialName(request)}</p>
                <p className="request-details">
                  <strong>{request.quantity}</strong> units at <strong>{request.siteName}</strong>
                </p>
                <p className="request-dates">
                  {new Date(request.plannedUsageStart).toLocaleDateString()} - {new Date(request.plannedUsageEnd).toLocaleDateString()}
                </p>
                <p className="requester">
                  Requested by: {request.requestedByName}
                </p>
              </div>

              <div className="request-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(request)}
                  disabled={isProcessing}
                >
                  ✓ Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => setSelectedRequest(request)}
                  disabled={isProcessing}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Reject Request #{selectedRequest.id}</h4>
            <p>Please provide a reason for rejection:</p>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setSelectedRequest(null)} disabled={isProcessing}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionComment.trim() || isProcessing}
                className="confirm-reject-btn"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .approval-queue {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .approval-queue h3 {
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .empty-state {
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }
        .request-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .request-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          transition: box-shadow 0.2s;
        }
        .request-card:hover {
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .request-id {
          font-weight: 600;
          color: #6b7280;
        }
        .badges {
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge.emergency {
          background: #fef2f2;
          color: #dc2626;
        }
        .badge.due-soon {
          background: #fef3c7;
          color: #d97706;
        }
        .material-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .request-details, .request-dates, .requester {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .request-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .approve-btn, .reject-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .approve-btn {
          background: #10b981;
          color: white;
        }
        .reject-btn {
          background: #f3f4f6;
          color: #dc2626;
        }
        .approve-btn:hover {
          background: #059669;
        }
        .reject-btn:hover {
          background: #fee2e2;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
        }
        .modal h4 {
          margin-bottom: 0.5rem;
        }
        .modal textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          margin: 1rem 0;
          resize: vertical;
        }
        .modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .modal-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .confirm-reject-btn {
          background: #dc2626;
          color: white;
        }
        .confirm-reject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
