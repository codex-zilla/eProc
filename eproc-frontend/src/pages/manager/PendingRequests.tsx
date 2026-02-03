import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  const [rejectionErrors, setRejectionErrors] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get<PendingRequest[]>('/requests/pending');
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (requestId: number) => {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(
        `/requests/${requestId}/status`,
        { status: 'APPROVED' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: number) => {
    const comment = approvalComment[requestId];
    if (!comment?.trim()) {
      setRejectionErrors(prev => ({ ...prev, [requestId]: 'Please provide a rejection reason' }));
      return;
    }
    
    // Clear specific error
    setRejectionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[requestId];
      return newErrors;
    });
    
    setError(null);
    setSuccess(null);
    try {
      await api.patch(
        `/requests/${requestId}/status`,
        { status: 'REJECTED', comment },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Request rejected');
      setTimeout(() => setSuccess(null), 3000);
      setApprovalComment(prev => ({ ...prev, [requestId]: '' }));
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // Cost impact badge color based on total estimate
  const getCostImpactColor = (total?: number): string => {
    if (!total) return 'bg-slate-100 text-slate-800';
    if (total < 1000000) return 'bg-green-100 text-green-800';
    if (total < 5000000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading requests...</p>
        </div>
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

      {/* Empty State */}
      {requests.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">All Clear!</h3>
                <p className="text-sm sm:text-base text-slate-500">No pending requests at the moment.</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">All requests have been processed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {requests.map(request => (
            <Card key={request.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-2 sm:gap-3">
                  <div className="flex-1 w-full">
                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      {request.emergencyFlag && (
                        <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium">
                          URGENT
                        </Badge>
                      )}
                      {request.revisionNumber && request.revisionNumber > 1 && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium">
                          Rev {request.revisionNumber}
                        </Badge>
                      )}
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        PENDING
                      </Badge>
                    </div>
                    
                    {/* BOQ Code & Work Description */}
                    {request.boqReferenceCode ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h3 className="font-semibold text-base sm:text-lg lg:text-xl font-mono text-slate-900">
                            {request.boqReferenceCode}
                          </h3>
                          {request.totalEstimate && (
                            <span className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap ${getCostImpactColor(request.totalEstimate)}`}>
                              TZS {request.totalEstimate.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 mb-1">
                          {request.workDescription}
                        </p>
                      </>
                    ) : (
                      <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-slate-900 mb-1">
                        {request.materialName || request.manualMaterialName}
                      </h3>
                    )}
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Site: <span className="font-medium text-slate-700">{request.siteName}</span>
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                  {request.measurementUnit && request.quantity && (
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5">Quantity</span>
                      <p className="font-semibold text-xs sm:text-sm text-slate-900">
                        {request.quantity} {request.measurementUnit}
                      </p>
                    </div>
                  )}
                  {!request.measurementUnit && (
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5">Quantity</span>
                      <p className="font-semibold text-xs sm:text-sm text-slate-900">{request.quantity}</p>
                    </div>
                  )}
                  {request.rateEstimate && (
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5">Rate</span>
                      <p className="font-semibold text-xs sm:text-sm text-slate-900">
                        TZS {request.rateEstimate.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5">Requested by</span>
                    <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate" title={request.requestedByName}>
                      {request.requestedByName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5">Date</span>
                    <p className="font-semibold text-xs sm:text-sm text-slate-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:items-end sm:justify-start pt-2 sm:pt-0">
                    <Link
                      to={`/manager/requests/${request.id}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-semibold inline-flex items-center gap-1"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-slate-200">
                  <Textarea
                    placeholder="Add comment for approval or reason for rejection"
                    value={approvalComment[request.id] || ''}
                    onChange={(e) => {
                      setApprovalComment(prev => ({ ...prev, [request.id]: e.target.value }));
                      // Clear error when user types
                      if (rejectionErrors[request.id]) {
                        setRejectionErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[request.id];
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full resize-none border-slate-200 bg-slate-50 focus:bg-white transition-colors text-xs sm:text-sm h-16 sm:h-20 ${
                      rejectionErrors[request.id] ? 'border-red-300 focus:ring-red-200' : ''
                    }`}
                    rows={2}
                  />
                  {rejectionErrors[request.id] && (
                    <div className="flex items-center gap-1.5 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{rejectionErrors[request.id]}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm"
                    >
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="destructive"
                      className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm"
                    >
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
