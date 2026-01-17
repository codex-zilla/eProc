import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface MaterialRequest {
  id: number;
  siteName: string;
  materialName?: string;
  manualMaterialName?: string;
  quantity: number;
  status: string;
  emergencyFlag: boolean;
  rejectionComment?: string;
  createdAt: string;
}

/**
 * My Requests page - list of engineer's own requests.
 */
const MyRequests = () => {
  const { logout } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await axios.get<MaterialRequest[]>(
          `${API_BASE}/api/requests/my`,
          { headers: getAuthHeaders() }
        );
        setRequests(response.data);
      } catch (err) {
        console.error('Failed to load requests:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [getAuthHeaders]);

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
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
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              filter === status 
                ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status}
            <span className="ml-2 text-sm">
              ({status === 'ALL' 
                ? requests.length 
                : requests.filter(r => r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No requests found.</p>
          <Link
            to="/engineer/requests/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {request.emergencyFlag && (
                        <span title="Emergency">🚨</span>
                      )}
                      <span className="font-medium">
                        {request.materialName || request.manualMaterialName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.siteName}</td>
                  <td className="px-6 py-4 text-sm">{request.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/engineer/requests/${request.id}`}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      {request.status === 'REJECTED' && (
                        <Link
                          to={`/engineer/requests/${request.id}/edit`}
                          className="text-yellow-600 hover:underline text-sm"
                        >
                          Edit & Resubmit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Comments Notice */}
      {filteredRequests.some(r => r.status === 'REJECTED' && r.rejectionComment) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Rejected Requests</h3>
          {filteredRequests
            .filter(r => r.status === 'REJECTED' && r.rejectionComment)
            .map(r => (
              <div key={r.id} className="text-sm text-yellow-700 mb-1">
                <strong>{r.materialName || r.manualMaterialName}:</strong> {r.rejectionComment}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
