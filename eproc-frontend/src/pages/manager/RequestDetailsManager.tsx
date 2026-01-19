import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Edit, 
  RotateCw, 
  AlertOctagon,
  ArrowLeft
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
  requestedById: number;
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
 * Request Details page for managers - view full request, approve/reject, audit timeline.
 */
const RequestDetailsManager = () => {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectComment, setRejectComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [reqRes, histRes] = await Promise.all([
        axios.get<RequestDetails>(`${API_BASE}/api/requests/${id}`, { headers: getAuthHeaders() }),
        axios.get<AuditEntry[]>(`${API_BASE}/api/requests/${id}/history`, { headers: getAuthHeaders() }),
      ]);
      setRequest(reqRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error('Failed to load request:', err);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/requests/${id}/status`,
        { status: 'APPROVED' },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess('Request approved!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/requests/${id}/status`,
        { status: 'REJECTED', comment: rejectComment },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess('Request rejected');
      setRejectComment('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

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
      case 'CREATED': return <FileText className="h-4 w-4" />;
      case 'SUBMITTED': return <Send className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'UPDATED': return <Edit className="h-4 w-4" />;
      case 'RESUBMITTED': return <RotateCw className="h-4 w-4" />;
      default: return <div className="h-2 w-2 rounded-full bg-gray-300" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading request...</div>;
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Request not found</p>
        <Link to="/manager/pending" className="text-indigo-600 hover:underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/manager/pending" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Pending Requests
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
            Request #{request.id}
          </h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Request Details Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {request.emergencyFlag && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded flex items-center gap-1">
                <AlertOctagon className="h-3 w-3" /> URGENT
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Site</h3>
            <p className="mt-1 text-lg">{request.siteName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
            <p className="mt-1 text-lg">{request.quantity}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
            <p className="mt-1">{request.requestedByName}</p>
            <p className="text-sm text-gray-500">{request.requestedByEmail}</p>
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

        {/* Approval Actions */}
        {request.status === 'PENDING' && (
          <div className="p-6 bg-gray-50 border-t">
            <h3 className="font-medium text-gray-900 mb-3">Take Action</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </button>
              <input
                type="text"
                placeholder="Rejection reason..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="flex-1 min-w-48 rounded-md border-gray-300"
              />
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </button>
            </div>
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

export default RequestDetailsManager;
