import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';

interface RequestDetails {
  id: number;
  siteName: string;
  materialId?: number;
  materialName?: string;
  manualMaterialName?: string;
  manualUnit?: string;
  manualEstimatedPrice?: number;
  quantity: number;
  status: string;
  emergencyFlag: boolean;
  rejectionComment?: string;
  plannedUsageStart?: string;
  plannedUsageEnd?: string;
  createdAt: string;
  updatedAt?: string;
  requestedByName: string;
  requestedByEmail: string;
}

interface AuditEntry {
  id: number;
  action: string;
  statusSnapshot?: string;
  comment?: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
}

/**
 * Request Details page for engineers - view request with audit timeline.
 */
const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqRes, histRes] = await Promise.all([
          api.get<RequestDetails>(`/requests/${id}`),
          api.get<AuditEntry[]>(`/requests/${id}/history`),
        ]);
        setRequest(reqRes.data);
        setHistory(histRes.data);
      } catch (err) {
        console.error('Failed to load request:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return '📝';
      case 'SUBMITTED': return '📤';
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'UPDATED': return '✏️';
      case 'RESUBMITTED': return '🔄';
      default: return '•';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading request...</div>;
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Request not found</p>
        <Link to="/engineer/requests" className="text-indigo-600 hover:underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/engineer/requests" className="text-indigo-600 hover:underline text-sm">
            ← Back to Requests
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
            Request #{request.id}
          </h1>
        </div>
        <div className="flex gap-2">
          {request.status === 'REJECTED' && (
            <Link
              to={`/engineer/requests/${id}/edit`}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit & Resubmit
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Request Details Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {request.emergencyFlag && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                🚨 URGENT
              </span>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {request.materialName || request.manualMaterialName}
            </h2>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadgeClass(request.status)}`}>
            {request.status}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Site</h3>
            <p className="mt-1 text-lg">{request.siteName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
            <p className="mt-1 text-lg">{request.quantity}</p>
          </div>
          {request.plannedUsageStart && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Planned Start</h3>
              <p className="mt-1">{new Date(request.plannedUsageStart).toLocaleString()}</p>
            </div>
          )}
          {request.plannedUsageEnd && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Planned End</h3>
              <p className="mt-1">{new Date(request.plannedUsageEnd).toLocaleString()}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {request.rejectionComment && (
          <div className="p-6 bg-red-50 border-t border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
            <p className="text-red-700">{request.rejectionComment}</p>
          </div>
        )}
      </div>

      {/* Audit Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Timeline</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No history available</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                    {getActionIcon(entry.action)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{entry.action}</span>
                    {entry.statusSnapshot && (
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadgeClass(entry.statusSnapshot)}`}>
                        {entry.statusSnapshot}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    by {entry.actorName} ({entry.actorRole})
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {entry.comment && (
                    <p className="mt-1 text-sm text-gray-600 italic">"{entry.comment}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
