import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

interface PendingRequest {
  id: number;
  siteName: string;
  materialName?: string;
  manualMaterialName?: string;
  quantity: number;
  status: string;
  emergencyFlag: boolean;
  createdAt: string;
  requestedById: number;
  requestedByName: string;
  requestedByEmail: string;
  // BOQ fields (Phase 1)
  boqReferenceCode?: string;
  workDescription?: string;
  measurementUnit?: string;
  totalEstimate?: number;
  rateEstimate?: number;
  revisionNumber?: number;
}

/**
 * Pending Requests page - approval queue for Project Owner.
 * Phase 1: Enhanced with BOQ fields and cost visibility.
 */
const PendingRequests = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalComment, setApprovalComment] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get<PendingRequest[]>('/requests/pending');
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (requestId: number) => {
    setError(null);
    try {
      await api.patch(
        `/requests/${requestId}/status`,
        { status: 'APPROVED' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request approved!');
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: number) => {
    const comment = approvalComment[requestId];
    if (!comment?.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setError(null);
    try {
      await api.patch(
        `/requests/${requestId}/status`,
        { status: 'REJECTED', comment },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request rejected');
      setApprovalComment(prev => ({ ...prev, [requestId]: '' }));
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // Cost impact badge color based on total estimate
  const getCostImpactColor = (total?: number): string => {
    if (!total) return 'bg-gray-100 text-gray-800';
    if (total < 1000000) return 'bg-green-100 text-green-800';
    if (total < 5000000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl md:text-4xl mb-4">✅</div>
          <p className="text-gray-500">No pending requests!</p>
          <p className="text-sm text-gray-400">All requests have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {request.emergencyFlag && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded whitespace-nowrap">
                       🚨 URGENT
                      </span>
                    )}
                    {request.revisionNumber && request.revisionNumber > 1 && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                        Rev {request.revisionNumber}
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded whitespace-nowrap">
                      PENDING
                    </span>
                  </div>
                  
                  {/* BOQ Code & Work Description */}
                  {request.boqReferenceCode ? (
                    <>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg font-mono">{request.boqReferenceCode}</h3>
                        {request.totalEstimate && (
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getCostImpactColor(request.totalEstimate)}`}>
                            TZS {request.totalEstimate.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{request.workDescription}</p>
                    </>
                  ) : (
                    <h3 className="font-semibold text-base sm:text-lg">
                      {request.materialName || request.manualMaterialName}
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Site: {request.siteName}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
                {request.measurementUnit && request.quantity && (
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{request.quantity} {request.measurementUnit}</p>
                  </div>
                )}
                {!request.measurementUnit && (
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{request.quantity}</p>
                  </div>
                )}
                {request.rateEstimate && (
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <p className="font-medium">TZS {request.rateEstimate.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Requested by:</span>
                  <p className="font-medium truncate">{request.requestedByName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Link
                    to={`/manager/requests/${request.id}`}
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Optional: Add comment for approval or reason for rejection"
                  value={approvalComment[request.id] || ''}
                  onChange={(e) => setApprovalComment(prev => ({ ...prev, [request.id]: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  rows={2}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
