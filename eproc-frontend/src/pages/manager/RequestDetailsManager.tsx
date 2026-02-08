import { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  User,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react';

interface MaterialItem {
  id: number;
  name: string;
  quantity: number;
  measurementUnit: string;
  rateEstimate: number;
  resourceType: 'MATERIAL' | 'LABOUR';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalEstimate: number;
  comment?: string;
}

interface RequestDetails {
  id: number;
  projectId: number;
  projectName: string;
  siteId: number;
  siteName: string;
  title: string;
  additionalDetails?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  priority?: string;
  status: string;
  boqReferenceCode?: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  totalValue: number;
  isDuplicateFlagged?: boolean;
  duplicateExplanation?: string;
  materials: MaterialItem[];
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
 * Request Details page for Project Owner - view full BOQ request, review/approve/reject materials.
 * Modern, responsive design matching app theme.
 */
const RequestDetailsManager = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectingMaterialId, setRejectingMaterialId] = useState<number | null>(null);
  const [processingMaterialId, setProcessingMaterialId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [reqRes, histRes] = await Promise.all([
        api.get<RequestDetails>(`/requests/${id}`),
        api.get<AuditEntry[]>(`/requests/${id}/history`).catch(() => ({ data: [] })),
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

  const handleMaterialAction = async (materialId: number, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    setProcessingMaterialId(materialId);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(
        `/requests/${id}/materials/${materialId}/status`,
        { status, comment },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess(`Material ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      setRejectingMaterialId(null);
      setRejectComment('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${status.toLowerCase()} material`);
    } finally {
      setProcessingMaterialId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'PARTIALLY_APPROVED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2a3455]" />;
      case 'SUBMITTED': return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />;
      case 'APPROVED': case 'MATERIAL_APPROVED': return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
      case 'REJECTED': case 'MATERIAL_REJECTED': return <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
      case 'UPDATED': return <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />;
      case 'RESUBMITTED': return <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />;
      default: return <div className="h-2 w-2 rounded-full bg-slate-300" />;
    }
  };

  // Separate materials and labour
  const materials = request?.materials?.filter(m => m.resourceType === 'MATERIAL') || [];
  const labour = request?.materials?.filter(m => m.resourceType === 'LABOUR') || [];

  // Calculate totals
  const materialTotal = materials.reduce((sum, m) => sum + (m.totalEstimate || m.quantity * m.rateEstimate), 0);
  const labourTotal = labour.reduce((sum, m) => sum + (m.totalEstimate || m.quantity * m.rateEstimate), 0);

  // Count pending items
  const pendingCount = (request?.materials || []).filter(m => m.status === 'PENDING').length;

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
          <p className="text-xs sm:text-sm text-slate-500">The request you're looking for doesn't exist.</p>
        </div>
        <Link to="/manager/pending" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm sm:text-base font-medium">
          Go back to Requests
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
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 flex-1">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-xs sm:text-sm">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900 font-bold text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      {/* Main Layout - Two columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
        {/* Left Column - Request Details */}
        <div className="lg:col-span-2 space-y-2 sm:space-y-3">
          {/* Project Info Card */}
          <Card className="border-slate-200 shadow-md overflow-hidden">
            <CardHeader className="p-2 sm:p-3 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white tracking-wide">
                Project: {request.projectName}
              </CardTitle>
            </CardHeader>
            {/* <div className="bg-[#2a3455] text-white p-2 ps-3">
              <h3 className="text-xs sm:text-base uppercase tracking-wide mb-0 font-semibold">PROJECT: <span className="font-bold">{request.projectName}</span></h3>
              <h3 className="text-xs sm:text-base uppercase tracking-wide font-semibold">SITE: <span className="font-normal">{request.siteName}</span></h3>
            </div> */}

            {/* Request Details Section */}
            <CardContent className='p-0 space-y-2'>
              {/* Title/Description */}
              <div className="px-3 pt-1 mb-0">
                <h4 className="font-semibold text-base sm:text-xl text-[#2a3455] tracking-wide">
                  {request.title || request.boqReferenceCode || 'BOQ Request'}
                </h4>
              </div>

              {/* Additional Information/Work Details */}
              {request.additionalDetails && (
                <div className="px-3 mb-1">
                  <p className="text-xs sm:text-sm text-[#2a3455]">{request.additionalDetails}</p>
                  <p className="text-xs sm:text-sm text-[#2a3455]">
                    Site: <span className="font-normal uppercase tracking-tighter">{request.siteName}</span>
                  </p>
                </div>
              )}

              {/* Duplicate Warning */}
              {request.isDuplicateFlagged && (
                <div className="mx-3 mt-1 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-800">Duplicate Request Warning</p>
                      <p className="text-xs text-orange-700 mt-1">
                        This request was flagged as a potential duplicate of another request.
                      </p>
                      {request.duplicateExplanation && (
                        <div className="mt-2 bg-white/50 p-2 rounded border border-orange-100">
                          <p className="text-xs font-semibold text-orange-800 mb-0.5">Engineer's Explanation:</p>
                          <p className="text-xs text-orange-700 italic">"{request.duplicateExplanation}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="px-3 py-1 flex flex-wrap items-center gap-2 tracking-tight">
                <Badge className={`${getStatusBadgeClass(request.status)} text-[10px] sm:text-xs px-3 py-1 font-semibold`}>
                  {request.status}
                </Badge>
                {request.priority === 'HIGH' && (
                  <Badge variant="destructive" className="text-[10px] sm:text-xs px-3 py-1 font-semibold">
                    <AlertOctagon className="h-3 w-3 mr-1" />
                    HIGH PRIORITY
                  </Badge>
                )}
              </div>

              {/* Request Metadata*/}
              <div className="grid grid-cols-2 gap-3 pt-1 p-3 pt-1 mb-0 bg-[#fefefe]">
                <div className="flex items-start gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Starting</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">
                      {request.plannedStartDate
                        ? new Date(request.plannedStartDate).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Ending</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">
                      {request.plannedEndDate
                        ? new Date(request.plannedEndDate).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Requested By</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">{request.createdByName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Created</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Estimate */}
              <div className="border-t border-slate-200 p-3 pt-1 mb-0 bg-[#fcfcfc]">
                <p className="text-lg sm:text-xl font-bold text-[#2a3455]">
                  <span className="text-xs sm:text-sm text-slate-600 mb-0 font-semibold pr-2">Total Estimate:</span>
                  <span className='font-mono tracking-tighter'>TZS {(request.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
                  Status: <span className="font-bold text-yellow-400">{pendingCount} {pendingCount === 1 ? 'Pending Review' : 'Pending Reviews'}</span>
                </p>
              </div>
            </CardContent>

          </Card>

          {/* Material Breakdown Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="p-2 sm:p-3 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Material Breakdown</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {/* Materials Section */}
              {materials.length > 0 && (
                <div className="border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#2a3455] px-2 py-3 border-b border-slate-100 bg-slate-50">
                    Cost of Materials
                  </h3>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader className="bg-slate-100 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2">Material</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Qty</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Unit</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-right hidden lg:table-cell">Rate(TZS)</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-right">Amount(TZS)</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Status</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.map((item) => (
                          <Fragment key={item.id}>
                            <TableRow className="hover:bg-slate-50 transition-colors cursor-pointer">
                              <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                                {item.name}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center text-sm text-slate-600 tracking-tighter">
                                {item.measurementUnit}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell tracking-tighter">
                                {item.rateEstimate.toLocaleString()}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-right text-sm font-medium font-mono text-slate-700 tracking-tighter">
                                {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center tracking-tighter">
                                <Badge className={`${getStatusBadgeClass(item.status)} text-[10px] px-2 py-0.5`}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center tracking-tighter">
                                {item.status === 'PENDING' && (
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => handleMaterialAction(item.id, 'APPROVED')}
                                      disabled={processingMaterialId === item.id}
                                      className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-[10px]"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => setRejectingMaterialId(item.id)}
                                      disabled={processingMaterialId === item.id}
                                      className="h-7 px-2 text-[10px]"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                            {rejectingMaterialId === item.id && (
                              <TableRow className="bg-slate-50">
                                <TableCell colSpan={7} className="p-0 border-b border-slate-200">
                                  <div className="flex flex-col gap-3">
                                    <Textarea
                                      placeholder="Please provide a reason for rejecting this item..."
                                      value={rejectComment}
                                      onChange={(e) => setRejectComment(e.target.value)}
                                      className="w-full resize-none h-24 text-sm rounded-none p-2"
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-3 px-3 pb-2 pt-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className='bg-slate-300'
                                        onClick={() => {
                                          setRejectingMaterialId(null);
                                          setRejectComment('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleMaterialAction(item.id, 'REJECTED', rejectComment)}
                                        disabled={!rejectComment.trim() || processingMaterialId === item.id}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Reject Item
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards - Improved Design */}
                  <div className="md:hidden space-y-3">
                    {materials.map((item) => (
                      <div key={item.id} className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200">
                        {/* Material Name and Quantity */}
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 mb-0">Material</p>
                          <p className="font-bold text-sm text-slate-900">{item.name}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600">Qty</p>
                            <p className="font-semibold text-slate-900">{item.quantity} {item.measurementUnit}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Rate</p>
                            <p className="font-semibold text-slate-900">TZS {item.rateEstimate.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Amount</p>
                            <p className="font-semibold text-slate-900">TZS {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-600">Status:</p>
                          <Badge className={`${getStatusBadgeClass(item.status)} text-[10px] px-2 py-0.5 uppercase font-bold`}>
                            {item.status}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        {item.status === 'PENDING' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleMaterialAction(item.id, 'APPROVED')}
                              disabled={processingMaterialId === item.id}
                              className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingMaterialId(item.id)}
                              disabled={processingMaterialId === item.id}
                              className="flex-1 h-8 rounded-full text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}


                        {/* Rejection Comment Input - Shows below buttons */}
                        {rejectingMaterialId === item.id && (
                          <div className="space-y-2 pt-2">
                            <Textarea
                              placeholder="Reason for rejection"
                              value={rejectComment}
                              onChange={(e) => setRejectComment(e.target.value)}
                              className="w-full resize-none h-16 text-xs"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingMaterialId(null);
                                  setRejectComment('');
                                }}
                                className="flex-1 h-7 text-xs bg-slate-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleMaterialAction(item.id, 'REJECTED', rejectComment)}
                                disabled={!rejectComment.trim()}
                                className="flex-1 h-7 text-xs"
                              >
                                Submit
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Materials Subtotal */}
                  <div className="bg-slate-50 px-2 py-2 flex justify-end border-t border-slate-200 hidden md:flex">
                    <span className="text-sm font-medium text-slate-600 me-3">Materials Subtotal:</span>
                    <span className="text-sm font-bold font-mono text-slate-900 pe-2 tracking-tighter">TZS {materialTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {/* Labour Section */}
              {labour.length > 0 && (
                <div className="border-b border-slate-200 mt-5">
                  <h3 className="text-sm font-semibold text-[#2a3455] px-2 py-3 border-b border-slate-100 bg-slate-50">
                    Cost of Labour
                  </h3>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader className="bg-slate-100 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2">Labour</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Qty</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Unit</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-right hidden lg:table-cell">Rate(TZS)</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-right">Amount(TZS)</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Status</TableHead>
                          <TableHead className="text-slate-800 text-xs sm:text-sm tracking-tigher font-semibold px-2 py-2 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {labour.map((item) => (
                          <Fragment key={item.id}>
                            <TableRow className="hover:bg-slate-50 transition-colors cursor-pointer">
                              <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                                {item.name}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center text-sm text-slate-600 tracking-tighter">
                                {item.measurementUnit}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell tracking-tighter">
                                {item.rateEstimate.toLocaleString()}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-right text-sm font-medium font-mono text-slate-700 tracking-tighter">
                                {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center tracking-tighter">
                                <Badge className={`${getStatusBadgeClass(item.status)} text-[10px] px-2 py-0.5`}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 py-2.5 text-center tracking-tighter">
                                {item.status === 'PENDING' && (
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => handleMaterialAction(item.id, 'APPROVED')}
                                      disabled={processingMaterialId === item.id}
                                      className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-[10px]"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => setRejectingMaterialId(item.id)}
                                      disabled={processingMaterialId === item.id}
                                      className="h-7 px-2 text-[10px]"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                            {rejectingMaterialId === item.id && (
                              <TableRow className="bg-slate-50">
                                <TableCell colSpan={7} className="p-0 border-b border-slate-200">
                                  <div className="flex flex-col gap-3">
                                    <Textarea
                                      placeholder="Please provide a reason for rejecting this item..."
                                      value={rejectComment}
                                      onChange={(e) => setRejectComment(e.target.value)}
                                      className="w-full resize-none h-24 text-sm rounded-none p-2"
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-3 px-3 pb-2 pt-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className='bg-slate-300'
                                        onClick={() => {
                                          setRejectingMaterialId(null);
                                          setRejectComment('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleMaterialAction(item.id, 'REJECTED', rejectComment)}
                                        disabled={!rejectComment.trim() || processingMaterialId === item.id}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Reject Item
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards - Improved Design */}
                  <div className="md:hidden space-y-3">
                    {labour.map((item) => (
                      <div key={item.id} className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200">
                        {/* Labour Name */}
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 mb-0">Labour</p>
                          <p className="font-bold text-sm text-slate-900">{item.name}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600">Qty</p>
                            <p className="font-semibold text-slate-900">{item.quantity} {item.measurementUnit}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Rate</p>
                            <p className="font-semibold text-slate-900">TZS {item.rateEstimate.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Amount</p>
                            <p className="font-semibold text-slate-900">TZS {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-600">Status:</p>
                          <Badge className={`${getStatusBadgeClass(item.status)} text-[10px] px-2 py-0.5 uppercase font-bold`}>
                            {item.status}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        {item.status === 'PENDING' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleMaterialAction(item.id, 'APPROVED')}
                              disabled={processingMaterialId === item.id}
                              className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingMaterialId(item.id)}
                              disabled={processingMaterialId === item.id}
                              className="flex-1 h-8 rounded-full text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}


                        {/* Rejection Comment Input - Shows below buttons */}
                        {rejectingMaterialId === item.id && (
                          <div className="space-y-2 pt-2">
                            <Textarea
                              placeholder="Reason for rejection"
                              value={rejectComment}
                              onChange={(e) => setRejectComment(e.target.value)}
                              className="w-full resize-none h-16 text-xs"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingMaterialId(null);
                                  setRejectComment('');
                                }}
                                className="flex-1 h-7 text-xs bg-slate-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleMaterialAction(item.id, 'REJECTED', rejectComment)}
                                disabled={!rejectComment.trim()}
                                className="flex-1 h-7 text-xs"
                              >
                                Submit
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Labour Subtotal */}
                  <div className="bg-slate-50 px-2 py-2 flex justify-end border-t border-slate-200 hidden md:flex">
                    <span className="text-sm font-medium text-slate-600 me-3">Labour Subtotal:</span>
                    <span className="text-sm font-bold font-mono text-slate-900 pe-2 tracking-tighter">TZS {labourTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Request Timeline */}
        <div className="space-y-2 sm:space-y-3">
          {/* Audit Timeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-[#2a3455] text-white p-2 sm:p-3 rounded-t-lg border-b border-slate-200">
              <CardTitle className="text-sm sm:text-base font-semibold tracking-wide">Request Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs sm:text-base text-slate-500">No history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="flex gap-2">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-6 h-6 bg-[#2a3455]/10 rounded-full flex items-center justify-center">
                          {getActionIcon(entry.action)}
                        </div>
                        {index < Math.min(history.length - 1, 4) && (
                          <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[16px]"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3 min-w-0">
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm">{entry.action.replace('_', ' ')}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">
                          by {entry.actorName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        {entry.comment && (
                          <p className="mt-1 text-[10px] sm:text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded">
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
      </div>



      {/* Material Detail Modal (Mobile) */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 md:hidden">
          <Card className="w-full max-w-sm shadow-2xl border-slate-200">
            <CardHeader className="p-4 bg-[#2a3455] text-white flex flex-row items-center justify-between rounded-t-lg">
              <CardTitle className="text-sm font-semibold">Item Details</CardTitle>
              <button onClick={() => setSelectedMaterial(null)} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Name</p>
                <p className="text-sm font-semibold text-slate-900">{selectedMaterial.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Quantity</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedMaterial.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Unit</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedMaterial.measurementUnit}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Rate</p>
                  <p className="text-sm font-semibold text-slate-900">TZS {selectedMaterial.rateEstimate.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Amount</p>
                  <p className="text-sm font-semibold text-slate-900">TZS {(selectedMaterial.totalEstimate || selectedMaterial.quantity * selectedMaterial.rateEstimate).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Status</p>
                <Badge className={`${getStatusBadgeClass(selectedMaterial.status)} text-[10px] px-2 py-0.5`}>
                  {selectedMaterial.status}
                </Badge>
              </div>

              {selectedMaterial.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      handleMaterialAction(selectedMaterial.id, 'APPROVED');
                      setSelectedMaterial(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectingMaterialId(selectedMaterial.id);
                      setSelectedMaterial(null);
                    }}
                    className="flex-1 h-9"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedMaterial(null)}
                className="w-full border-slate-200 mt-2"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestDetailsManager;
