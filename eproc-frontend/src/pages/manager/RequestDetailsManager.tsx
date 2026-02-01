import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Edit, 
  RotateCw, 
  AlertOctagon,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

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
  // BOQ fields (Phase 1)
  boqReferenceCode?: string;
  workDescription?: string;
  measurementUnit?: string;
  rateEstimate?: number;
  rateType?: string;
  revisionNumber?: number;
  totalEstimate?: number;
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
 * Request Details page for Project Owner - view full BOQ item request, approve/reject, audit timeline.
 * Phase 1: Enhanced with BOQ field display and cost-aware approval workflow.
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
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);

  const loadData = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    setError(null);
    try {
      await api.patch(
        `/requests/${id}/status`,
        { status: 'APPROVED' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request approved!');
      setShowApprovalConfirm(false);
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
      await api.patch(
        `/requests/${id}/status`,
        { status: 'REJECTED', comment: rejectComment },
        { headers: { 'Content-Type': 'application/json' } }
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
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        to="/manager/pending"
        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Pending Requests
      </Link>

      {/* Messages */}
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

      {/* Main Request Card */}
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
                {request.emergencyFlag && (
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" />
                    URGENT
                  </span>
                )}
                {request.revisionNumber && request.revisionNumber > 1 && (
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Revision {request.revisionNumber}
                  </span>
                )}
              </div>
              
              {request.boqReferenceCode ? (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono mb-2">
                    {request.boqReferenceCode}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-700">{request.workDescription}</p>
                </>
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {request.materialName || request.manualMaterialName || 'Material Request'}
                </h1>
              )}
            </div>

            {request.totalEstimate && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center min-w-[200px]">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Total Estimate</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900">
                  TZS {request.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                {request.measurementUnit && request.rateEstimate && (
                  <div className="text-xs text-gray-600 mt-1">
                    {request.quantity} {request.measurementUnit} × TZS {request.rateEstimate.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOQ Details Section (if BOQ request) */}
        {request.boqReferenceCode && (
          <div className="p-4 sm:p-6 bg-blue-50 border-b">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">BOQ Item Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {request.measurementUnit && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Measurement Unit</h3>
                  <p className="mt-1 text-base sm:text-lg font-semibold">{request.measurementUnit}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Quantity</h3>
                <p className="mt-1 text-base sm:text-lg font-semibold">
                  {request.quantity} {request.measurementUnit || ''}
                </p>
              </div>
              {request.rateEstimate && (
                <>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Rate Estimate</h3>
                    <p className="mt-1 text-base sm:text-lg font-semibold">
                      TZS {request.rateEstimate.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Rate Type</h3>
                    <p className="mt-1 text-sm">
                      {request.rateType?.replace('_', ' ') || 'ENGINEER ESTIMATE'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* General Details */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Site</h3>
            <p className="mt-1 text-base">{request.siteName}</p>
          </div>
          
          {!request.boqReferenceCode && (
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Quantity</h3>
              <p className="mt-1 text-base">{request.quantity}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Requested By</h3>
            <p className="mt-1 text-sm sm:text-base">{request.requestedByName}</p>
            <p className="text-xs text-gray-500">{request.requestedByEmail}</p>
          </div>
          
          {request.plannedUsageStart && (
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Planned Start</h3>
              <p className="mt-1 text-sm">{new Date(request.plannedUsageStart).toLocaleString()}</p>
            </div>
          )}
          
          {request.plannedUsageEnd && (
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Planned End</h3>
              <p className="mt-1 text-sm">{new Date(request.plannedUsageEnd).toLocaleString()}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-sm">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Rejection Comment Display */}
        {request.status === 'REJECTED' && request.rejectionComment && (
          <div className="p-4 sm:p-6 bg-red-50 border-t border-red-200">
            <h3 className="text-sm font-medium text-red-900 mb-2">Rejection Reason</h3>
            <p className="text-sm text-red-700 italic">"{request.rejectionComment}"</p>
          </div>
        )}

        {/* Approval Actions */}
        {request.status === 'PENDING' && (
          <div className="p-4 sm:p-6 bg-gray-50 border-t">
            <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Take Action</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowApprovalConfirm(true)}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm sm:text-base"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Approve Request
              </button>
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Rejection reason (required for rejection)..."
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 text-sm"
                />
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm sm:text-base whitespace-nowrap"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Confirmation Dialog */}
      {showApprovalConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Approval</h2>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-700">
                By approving this request, you authorize the execution of {request.boqReferenceCode ? 'the quantified scope of work' : 'this material procurement'}.
              </p>
              
              {request.totalEstimate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Cost Implication</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    TZS {request.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This approval commits the project budget to this expenditure.
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                This action will be recorded in the audit log and cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Timeline */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Request Timeline</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history available</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    {getActionIcon(entry.action)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{entry.action}</span>
                    {entry.statusSnapshot && (
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadgeClass(entry.statusSnapshot)}`}>
                        {entry.statusSnapshot}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    by {entry.actorName} ({entry.actorRole})
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {entry.comment && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 italic">"{entry.comment}"</p>
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
