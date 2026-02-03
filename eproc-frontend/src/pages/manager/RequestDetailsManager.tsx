import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  RotateCw,
  AlertOctagon,
  DollarSign,
  AlertCircle
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
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectComment, setRejectComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
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
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(
        `/requests/${id}/status`,
        { status: 'APPROVED' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setShowApprovalConfirm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      setRejectionError('Please provide a rejection reason');
      return;
    }
    setRejectionError(null);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(
        `/requests/${id}/status`,
        { status: 'REJECTED', comment: rejectComment },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request rejected');
      setTimeout(() => setSuccess(null), 3000);
      setRejectComment('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2a3455]" />;
      case 'SUBMITTED': return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />;
      case 'APPROVED': return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
      case 'UPDATED': return <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />;
      case 'RESUBMITTED': return <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />;
      default: return <div className="h-2 w-2 rounded-full bg-slate-300" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Request not found</p>
          <p className="text-xs sm:text-sm text-slate-500">The request you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link to="/manager/pending" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm sm:text-base font-medium">
          Go back to Pending Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 flex-1">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-900 font-bold text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 flex-1">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-xs sm:text-sm">{success}</span>
          </div>
          <button 
            onClick={() => setSuccess(null)} 
            className="text-green-700 hover:text-green-900 font-bold text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Request Card */}
      <Card className="border-slate-200 shadow-sm">
        {/* Header */}
        <CardHeader className="p-3 sm:p-4 lg:p-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Badge className={`${getStatusBadgeClass(request.status)} text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-semibold`}>
                  {request.status}
                </Badge>
                {request.emergencyFlag && (
                  <Badge variant="destructive" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-semibold">
                    <AlertOctagon className="h-3 w-3 mr-1" />
                    URGENT
                  </Badge>
                )}
                {request.revisionNumber && request.revisionNumber > 1 && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-semibold">
                    Revision {request.revisionNumber}
                  </Badge>
                )}
              </div>
              
              {/* Title */}
              {request.boqReferenceCode ? (
                <>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 font-mono mb-1.5 sm:mb-2">
                    {request.boqReferenceCode}
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-700">{request.workDescription}</p>
                </>
              ) : (
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  {request.materialName || request.manualMaterialName || 'Material Request'}
                </h1>
              )}
            </div>

            {/* Cost Badge */}
            {request.totalEstimate && (
              <div className="w-full lg:w-auto bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4 text-center lg:min-w-[200px]">
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-600 mb-1">
                  <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="font-medium">Total Estimate</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-900">
                  TZS {request.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                {request.measurementUnit && request.rateEstimate && (
                  <div className="text-[10px] sm:text-xs text-slate-600 mt-1">
                    {request.quantity} {request.measurementUnit} × TZS {request.rateEstimate.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {/* BOQ Details Section (if BOQ request) */}
        {request.boqReferenceCode && (
          <div className="p-3 sm:p-4 lg:p-6 bg-blue-50/50 border-b border-slate-200">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">BOQ Item Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {request.measurementUnit && (
                <div>
                  <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Measurement Unit</h3>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">{request.measurementUnit}</p>
                </div>
              )}
              <div>
                <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Quantity</h3>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                  {request.quantity} {request.measurementUnit || ''}
                </p>
              </div>
              {request.rateEstimate && (
                <>
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Rate Estimate</h3>
                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                      TZS {request.rateEstimate.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Rate Type</h3>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">
                      {request.rateType?.replace('_', ' ') || 'ENGINEER ESTIMATE'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* General Details */}
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div>
              <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Site</h3>
              <p className="text-sm sm:text-base font-semibold text-slate-900">{request.siteName}</p>
            </div>
            
            {!request.boqReferenceCode && (
              <div>
                <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Quantity</h3>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{request.quantity}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Requested By</h3>
              <p className="text-sm sm:text-base font-semibold text-slate-900">{request.requestedByName}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{request.requestedByEmail}</p>
            </div>
            
            {request.plannedUsageStart && (
              <div>
                <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Planned Start</h3>
                <p className="text-xs sm:text-sm text-slate-900">{new Date(request.plannedUsageStart).toLocaleString()}</p>
              </div>
            )}
            
            {request.plannedUsageEnd && (
              <div>
                <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Planned End</h3>
                <p className="text-xs sm:text-sm text-slate-900">{new Date(request.plannedUsageEnd).toLocaleString()}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Created</h3>
              <p className="text-xs sm:text-sm text-slate-900">{new Date(request.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>

        {/* Rejection Comment Display */}
        {request.status === 'REJECTED' && request.rejectionComment && (
          <div className="p-3 sm:p-4 lg:p-6 bg-red-50 border-t border-red-200">
            <h3 className="text-xs sm:text-sm font-semibold text-red-900 mb-1.5 sm:mb-2">Rejection Reason</h3>
            <p className="text-xs sm:text-sm text-red-700 italic">"{request.rejectionComment}"</p>
          </div>
        )}

        {/* Approval Actions */}
        {request.status === 'PENDING' && (
          <div className="p-3 sm:p-4 lg:p-6 bg-slate-50 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Take Action</h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={() => setShowApprovalConfirm(true)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> 
                Approve Request
              </Button>
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Rejection reason (required for rejection)..."
                  value={rejectComment}
                  onChange={(e) => {
                    setRejectComment(e.target.value);
                    if (rejectionError) setRejectionError(null);
                  }}
                  className={`w-full resize-none border-slate-200 bg-white text-xs sm:text-sm h-16 sm:h-20 ${
                    rejectionError ? 'border-red-300 focus:ring-red-200' : ''
                  }`}
                  rows={2}
                />
                {rejectionError && (
                  <div className="flex items-center gap-1.5 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{rejectionError}</span>
                  </div>
                )}
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm"
                >
                  <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Approval Confirmation Dialog */}
      {showApprovalConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <Card className="max-w-md w-full shadow-2xl border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Confirm Approval</h2>
              </div>
              
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-slate-700">
                  By approving this request, you authorize the execution of {request.boqReferenceCode ? 'the quantified scope of work' : 'this material procurement'}.
                </p>
                
                {request.totalEstimate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-semibold text-yellow-900 mb-1">Cost Implication</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-900">
                      TZS {request.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">
                      This approval commits the project budget to this expenditure.
                    </p>
                  </div>
                )}
                
                <p className="text-[10px] sm:text-xs text-slate-500">
                  This action will be recorded in the audit log and cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalConfirm(false)}
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-100 h-9 sm:h-10 text-xs sm:text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm"
                >
                  Confirm Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Timeline */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">Request Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          {history.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">No history available</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="flex gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2a3455]/10 rounded-full flex items-center justify-center">
                      {getActionIcon(entry.action)}
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 mt-1.5 sm:mt-2 min-h-[20px]"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-3 sm:pb-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base">{entry.action}</span>
                      {entry.statusSnapshot && (
                        <Badge className={`${getStatusBadgeClass(entry.statusSnapshot)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                          {entry.statusSnapshot}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      by <span className="font-medium">{entry.actorName}</span> ({entry.actorRole})
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.comment && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 italic bg-slate-50 p-2 rounded border-l-2 border-slate-300">
                        "{entry.comment}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDetailsManager;
