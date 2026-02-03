import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  RotateCw,
  AlertOctagon,
  AlertCircle,
  Calendar,
  FileDown
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
  updatedAt?: string;
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
 * Request Details page for engineers - view BOQ item request with full details.
 */
const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      case 'CREATED': return <FileText className="h-4 w-4 text-slate-600" />;
      case 'SUBMITTED': return <Send className="h-4 w-4 text-blue-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'UPDATED': return <Edit className="h-4 w-4 text-amber-600" />;
      case 'RESUBMITTED': return <RotateCw className="h-4 w-4 text-indigo-600" />;
      default: return <div className="h-2 w-2 rounded-full bg-slate-300" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVED': return 'bg-green-100';
      case 'REJECTED': return 'bg-red-100';
      case 'RESUBMITTED': return 'bg-blue-100';
      default: return 'bg-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm text-slate-500 font-medium animate-pulse">Loading request...</p>
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
        <Link to="/engineer/requests" className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-medium">
          Go back to My Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4 mb-1">
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between w-full gap-3 flex-wrap mb-1.5 sm:mb-2">
              <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-slate-900">
                {request.boqReferenceCode || `Request #${request.id}`}
              </h1>
              <Badge className={`${getStatusBadgeClass(request.status)} lg:hidden text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 font-semibold uppercase me-2`}>
                {request.status}
              </Badge>
            </div>

          </div>
          
          <Badge className={`${getStatusBadgeClass(request.status)} hidden lg:inline-flex text-xs px-3 py-1 font-semibold uppercase me-2`}>
            {request.status}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-900 font-bold text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Details Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Work Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {request.workDescription && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {request.workDescription}
                  </p>
                  <hr className="border-slate-200 mt-4 sm:mt-6 mb-4 sm:mb-6" />
                </div>
              )}
              
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                {request.measurementUnit && (
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-xs sm:text-xs font-medium text-slate-500 uppercase tracking-wide min-w-[120px] sm:min-w-[140px]">
                      Measurement Unit:
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-semibold text-slate-900">{request.measurementUnit}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xs sm:text-xs font-medium text-slate-500 uppercase tracking-wide min-w-[120px] sm:min-w-[140px]">
                    Quantity:
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    {request.quantity.toFixed(2)}
                  </p>
                </div>
                
                {request.rateEstimate && (
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-xs sm:text-xs font-medium text-slate-500 uppercase tracking-wide min-w-[120px] sm:min-w-[140px]">
                      Rate Estimate:
                    </h4>
                    <div className="flex flex-col min-[376px]:flex-row min-[376px]:items-center gap-1 min-[376px]:gap-2">
                      <p className="text-sm sm:text-base font-semibold text-slate-900">
                        TZS {request.rateEstimate.toLocaleString()}
                      </p>
                      {request.rateType && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-[10px] px-2 py-0.5 min-[376px]:ml-0 w-fit">
                          {request.rateType.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {request.totalEstimate && (
                <div className="pt-4 sm:pt-6 border-t border-slate-200">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-base font-semibold text-amber-900 mb-1 lg:mb-2">Total Estimate</h3>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900">
                      TZS {request.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Material Breakdown Card */}
          {request.boqReferenceCode && (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white">Material Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Material</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Quantity & Unit</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 sm:p-4 text-slate-900 font-medium">
                          {request.materialName || request.manualMaterialName || 'Material'}
                        </td>
                        <td className="p-3 sm:p-4 text-right text-slate-900">
                          {request.quantity} {request.measurementUnit || request.manualUnit || ''}
                        </td>
                        <td className="p-3 sm:p-4 text-right text-slate-900">
                          @ TZS {(request.rateEstimate || request.manualEstimatedPrice || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="p-3 sm:p-4 text-right font-semibold text-slate-900">Subtotal:</td>
                        <td className="p-3 sm:p-4 text-right font-bold text-slate-900">
                          TZS {(request.totalEstimate || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {request.plannedUsageStart && request.plannedUsageEnd && (
                  <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Planned Usage:</span>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-900 font-semibold">
                      {new Date(request.plannedUsageStart).toLocaleDateString()} - {new Date(request.plannedUsageEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2 sm:py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${request.emergencyFlag ? 'bg-red-500' : 'bg-slate-300'}`}>
                      {request.emergencyFlag && <XCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Emergency Flag:</span>
                  </div>
                  <Badge variant={request.emergencyFlag ? "destructive" : "secondary"} className="text-[10px] sm:text-xs">
                    {request.emergencyFlag ? (
                      <><AlertOctagon className="h-3 w-3 mr-1" /> Yes</>
                    ) : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Revision History Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Revision History</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-500">No history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(entry.action)}`}>
                          {getActionIcon(entry.action)}
                        </div>
                        {index < history.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-200 mt-2 min-h-[30px]"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {entry.action === 'CREATED' ? 'Rev 1: Created' :
                             entry.action === 'RESUBMITTED' ? `Rev ${request.revisionNumber || 2}: Resubmitted` :
                             entry.action === 'APPROVED' ? `Rev ${request.revisionNumber || 2}: Approved` :
                             entry.action === 'REJECTED' ? `Rev ${request.revisionNumber || 1}: Rejected` :
                             entry.action}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">
                          {entry.action === 'APPROVED' ? 'Approved' : 
                           entry.action === 'REJECTED' ? 'Rejected' :
                           entry.action === 'RESUBMITTED' ? 'Resubmitted' :
                           'Created'} by {entry.actorName}
                        </p>
                        {entry.comment && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            {entry.comment}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(entry.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Documents Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Related Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {request.boqReferenceCode && (
                  <>
                    <a 
                      href="#" 
                      className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:underline group"
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {request.boqReferenceCode}.pdf
                      </span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:underline group"
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Drawings (A101, S202).pdf
                      </span>
                    </a>
                  </>
                )}
                {!request.boqReferenceCode && (
                  <p className="text-sm text-slate-500 text-center py-4">No documents attached</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                {request.status === 'REJECTED' && (
                  <Button
                    asChild
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-10 text-sm font-medium shadow-sm"
                  >
                    <Link to={`/engineer/requests/${id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit & Resubmit
                    </Link>
                  </Button>
                )}
                
                {request.boqReferenceCode && (
                  <Button
                    variant="outline"
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-10 text-sm font-medium"
                  >
                    Create Variation
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-10 text-sm font-medium"
                >
                  View in Context
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Comment Display */}
          {request.status === 'REJECTED' && request.rejectionComment && (
            <Card className="border-red-200 shadow-sm bg-red-50 overflow-hidden">
              <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-red-700 italic">"{request.rejectionComment}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
