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
}

/**
 * Pending Requests page - approval queue for manager.
 */
const PendingRequests = () => {

  
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalComment, setApprovalComment] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);



  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get<PendingRequest[]>(
        '/requests/pending'
      );
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError(null)} className="float-right">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right">×</button>
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
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {request.emergencyFlag && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        🚨 URGENT
                      </span>
                    )}
                    <h3 className="font-semibold text-lg">
                      {request.materialName || request.manualMaterialName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">Site: {request.siteName}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  PENDING
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <p className="font-medium">{request.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-500">Requested by:</span>
                  <p className="font-medium">{request.requestedByName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Link
                    to={`/manager/requests/${request.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    ✓ Approve
                  </button>
                  <input
                    type="text"
                    placeholder="Rejection reason..."
                    value={approvalComment[request.id] || ''}
                    onChange={(e) => setApprovalComment(prev => ({ ...prev, [request.id]: e.target.value }))}
                    className="flex-1 min-w-48 rounded-md border-gray-300 text-sm"
                  />
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
