import { useState, Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequest, useRequestHistory, useUpdateMaterial } from '@/hooks/queries/useRequests';
import type { RequestItem, DuplicateDetail } from '@/types/models';
import { formatDate, formatCurrency } from '../../lib/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// ─── Helper sub-components ─────────────────────────────────────────────────────

const DuplicateIndicator = ({ isDuplicate }: { isDuplicate?: boolean }) => {
  if (!isDuplicate) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center ml-1 text-orange-500 cursor-help">
          <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent><p>Potential Duplicate</p></TooltipContent>
    </Tooltip>
  );
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

// ─── ItemsTable sub-component ──────────────────────────────────────────────────
// Renders a desktop table + mobile cards for both Materials and Labour sections.
// This eliminates the ~250-line duplication in the original file.

interface ItemsTableProps {
  label: string;
  items: RequestItem[];
  subtotal: number;
  rejectingMaterialId: number | null;
  processingMaterialId: number | null;
  rejectComment: string;
  onSelectItem: (item: RequestItem) => void;
  onApprove: (id: number) => void;
  onStartReject: (id: number) => void;
  onCancelReject: () => void;
  onRejectCommentChange: (comment: string) => void;
  onConfirmReject: (id: number) => void;
}

const ItemsTable = ({
  label,
  items,
  subtotal,
  rejectingMaterialId,
  processingMaterialId,
  rejectComment,
  onSelectItem,
  onApprove,
  onStartReject,
  onCancelReject,
  onRejectCommentChange,
  onConfirmReject,
}: ItemsTableProps) => (
  <div className="border-b border-slate-200">
    <h3 className="text-sm font-semibold text-[#2a3455] px-2 py-3 border-b border-slate-100 bg-slate-50">
      {label}
    </h3>

    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-slate-100 border-b border-slate-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2">{label === 'Cost of Materials' ? 'Material' : 'Labour'}</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Qty</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Unit</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right hidden lg:table-cell">Rate(TZS)</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right">Amount(TZS)</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Status</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <Fragment key={item.id}>
              <TableRow
                onClick={() => onSelectItem(item)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                  {item.name}
                  <DuplicateIndicator isDuplicate={item.isDuplicate} />
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center text-sm font-mono text-slate-600">{item.quantity}</TableCell>
                <TableCell className="px-2 py-2.5 text-center text-sm text-slate-600">{item.measurementUnit}</TableCell>
                <TableCell className="px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell">
                  {formatCurrency(item.rateEstimate, false)}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-right text-sm font-medium font-mono text-slate-700">
                  {formatCurrency(item.totalEstimate || item.quantity * item.rateEstimate, false)}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center">
                  <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5" />
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center">
                  {item.status === 'PENDING' && (
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        onClick={() => onApprove(item.id)}
                        disabled={processingMaterialId === item.id}
                        className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-[10px]"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onStartReject(item.id)}
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
                    <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      <Textarea
                        placeholder="Please provide a reason for rejecting this item..."
                        value={rejectComment}
                        onChange={(e) => onRejectCommentChange(e.target.value)}
                        className="w-full resize-none h-24 text-sm rounded-none p-2"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end gap-3 px-3 pb-2 pt-0">
                        <Button variant="outline" size="sm" className="bg-slate-300" onClick={onCancelReject}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onConfirmReject(item.id)}
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

    {/* Mobile Cards */}
    <div className="md:hidden space-y-0">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectItem(item)}
          className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-600 mb-0">
              {label === 'Cost of Materials' ? 'Material' : 'Labour'}
              <DuplicateIndicator isDuplicate={item.isDuplicate} />
            </p>
            <p className="font-bold text-sm text-slate-900">{item.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-600">Qty</p>
              <p className="font-semibold text-slate-900">{item.quantity} {item.measurementUnit}</p>
            </div>
            <div>
              <p className="text-slate-600">Rate</p>
              <p className="font-semibold text-slate-900">{formatCurrency(item.rateEstimate, false)}</p>
            </div>
            <div>
              <p className="text-slate-600">Amount</p>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.totalEstimate || item.quantity * item.rateEstimate, false)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-600">Status:</p>
            <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5 uppercase font-bold" />
          </div>
          {item.status === 'PENDING' && (
            <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                onClick={() => onApprove(item.id)}
                disabled={processingMaterialId === item.id}
                className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onStartReject(item.id)}
                disabled={processingMaterialId === item.id}
                className="flex-1 h-8 rounded-full text-xs"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
          {rejectingMaterialId === item.id && (
            <div className="space-y-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <Textarea
                placeholder="Reason for rejection"
                value={rejectComment}
                onChange={(e) => onRejectCommentChange(e.target.value)}
                className="w-full resize-none h-16 text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onCancelReject} className="flex-1 h-7 text-xs bg-slate-300">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onConfirmReject(item.id)}
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

    {/* Subtotal */}
    <div className="bg-slate-50 px-2 py-2 hidden md:flex justify-end border-t border-slate-200">
      <span className="text-sm font-medium text-slate-600 me-3">
        {label === 'Cost of Materials' ? 'Materials' : 'Labour'} Subtotal:
      </span>
      <span className="text-sm font-bold font-mono text-slate-900 pe-2 tracking-tighter">
        {formatCurrency(subtotal)}
      </span>
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

/**
 * Request Details page for Project Owner — view full BOQ request,
 * review/approve/reject materials.
 */
const RequestDetailsManager = () => {
  const { id } = useParams<{ id: string }>();
  const requestId = id ? parseInt(id, 10) : 0;

  const { data: request, isLoading: loadingRequest, error: requestError } = useRequest(requestId);
  const { data: history = [], isLoading: loadingHistory } = useRequestHistory(requestId);
  const updateMaterialMutation = useUpdateMaterial();

  const [rejectComment, setRejectComment] = useState('');
  const [rejectingMaterialId, setRejectingMaterialId] = useState<number | null>(null);
  const [processingMaterialId, setProcessingMaterialId] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<RequestItem | null>(null);

  const loading = loadingRequest || loadingHistory;
  const error = requestError
    ? requestError instanceof Error ? requestError.message : 'Failed to load request details'
    : null;

  const handleMaterialAction = async (materialId: number, status: string, comment?: string) => {
    if (!request) return;
    setProcessingMaterialId(materialId);
    try {
      await updateMaterialMutation.mutateAsync({
        requestId: request.id,
        materialId,
        data: { status, comment }
      });
      if (status === 'REJECTED') {
        setRejectingMaterialId(null);
        setRejectComment('');
      }
      toast.success(`Item ${status.toLowerCase()} successfully`);
    } catch { /* error handled by hook */ } finally {
      setProcessingMaterialId(null);
    }
  };

  const handleCancelReject = () => {
    setRejectingMaterialId(null);
    setRejectComment('');
  };

  const materials = request?.materials?.filter(m => m.resourceType === 'MATERIAL') || [];
  const labour = request?.materials?.filter(m => m.resourceType === 'LABOUR') || [];
  const materialTotal = materials.reduce((sum, m) => sum + (m.totalEstimate || m.quantity * m.rateEstimate), 0);
  const labourTotal = labour.reduce((sum, m) => sum + (m.totalEstimate || m.quantity * m.rateEstimate), 0);
  const pendingCount = (request?.materials || []).filter(m => m.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading request..." />
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
        <Link to="/manager/requests" className="text-[#2a3455] hover:text-[#1e253e] hover:underline text-sm sm:text-base font-medium">
          Go back to Requests
        </Link>
      </div>
    );
  }

  // Shared handler props for ItemsTable
  const itemsTableHandlers = {
    rejectingMaterialId,
    processingMaterialId,
    rejectComment,
    onSelectItem: setSelectedMaterial,
    onApprove: (id: number) => handleMaterialAction(id, 'APPROVED'),
    onStartReject: setRejectingMaterialId,
    onCancelReject: handleCancelReject,
    onRejectCommentChange: setRejectComment,
    onConfirmReject: (id: number) => handleMaterialAction(id, 'REJECTED', rejectComment),
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            {/* Project Info Card */}
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="p-2 sm:p-3 bg-[#2a3455] rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white tracking-wide">
                  Project: {request.projectName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                {/* Title */}
                <div className="px-3 pt-1 mb-0">
                  <h4 className="font-semibold text-base sm:text-xl text-[#2a3455] tracking-wide">
                    {request.title || request.boqReferenceCode || 'BOQ Request'}
                  </h4>
                </div>

                {/* Additional Details */}
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
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-800">Duplicate Request Warning</p>
                        <p className="text-xs text-orange-700 mt-1">
                          This request was flagged as a potential duplicate of
                          {request.duplicateOfRequestId ? (
                            <Link
                              to={`/manager/requests/${request.duplicateOfRequestId}`}
                              className="font-semibold underline ml-1 hover:text-orange-900"
                            >
                              {request.duplicateOfRequestTitle || `#${request.duplicateOfRequestId}`}
                            </Link>
                          ) : ' another request'}.
                        </p>
                        {request.duplicateDetails && request.duplicateDetails.length > 0 && (
                          <div className="mt-3 overflow-x-auto bg-white/40 rounded border border-orange-100">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="border-b border-orange-200 bg-orange-100/30">
                                  <th className="py-1.5 px-2 text-orange-800 font-semibold">Material</th>
                                  <th className="py-1.5 px-2 text-orange-800 font-semibold">Current Request</th>
                                  <th className="py-1.5 px-2 text-orange-800 font-semibold">Original Request</th>
                                </tr>
                              </thead>
                              <tbody>
                                {request.duplicateDetails.map((detail: DuplicateDetail, idx: number) => (
                                  <tr key={idx} className="border-b border-orange-100 last:border-0 hover:bg-orange-100/20">
                                    <td className="py-1.5 px-2 text-orange-900 font-medium">{detail.materialName}</td>
                                    <td className="py-1.5 px-2 text-orange-800">
                                      Qty: {detail.currentQuantity}<br />
                                      <span className="opacity-75 text-[10px]">
                                        {detail.currentStartDate ? formatDate(detail.currentStartDate, 'short') : 'N/A'} – {detail.currentEndDate ? formatDate(detail.currentEndDate, 'short') : 'N/A'}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-orange-800">
                                      Qty: {detail.originalQuantity}<br />
                                      <span className="opacity-75 text-[10px]">
                                        {detail.originalStartDate ? formatDate(detail.originalStartDate, 'short') : 'N/A'} – {detail.originalEndDate ? formatDate(detail.originalEndDate, 'short') : 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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
                  <StatusBadge status={request.status} type="request" className="text-[10px] sm:text-xs px-3 py-1 font-semibold" />
                  {request.priority === 'HIGH' && (
                    <Badge variant="destructive" className="text-[10px] sm:text-xs px-3 py-1 font-semibold">
                      <AlertOctagon className="h-3 w-3 mr-1" /> HIGH PRIORITY
                    </Badge>
                  )}
                </div>

                {/* Request Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-1 p-3 bg-[#fefefe]">
                  {[
                    { icon: Calendar, label: 'Starting', value: request.plannedStartDate ? formatDate(request.plannedStartDate, 'short') : 'Not specified' },
                    { icon: Calendar, label: 'Ending', value: request.plannedEndDate ? formatDate(request.plannedEndDate, 'short') : 'Not specified' },
                    { icon: User, label: 'Requested By', value: request.createdByName },
                    { icon: Clock, label: 'Created', value: formatDate(request.createdAt, 'short') },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">{label}</p>
                        <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Estimate */}
                <div className="border-t border-slate-200 p-3 pt-1 bg-[#fcfcfc]">
                  <p className="text-lg sm:text-xl font-bold text-[#2a3455]">
                    <span className="text-xs sm:text-sm text-slate-600 font-semibold pr-2">Total Estimate:</span>
                    <span className="font-mono tracking-tighter">{formatCurrency(request.totalValue || 0)}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
                    Status:{' '}
                    <span className="font-bold text-yellow-500">
                      {pendingCount} {pendingCount === 1 ? 'Pending Review' : 'Pending Reviews'}
                    </span>
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
                {materials.length > 0 && (
                  <ItemsTable
                    label="Cost of Materials"
                    items={materials}
                    subtotal={materialTotal}
                    {...itemsTableHandlers}
                  />
                )}
                {labour.length > 0 && (
                  <div className={materials.length > 0 ? 'mt-5' : ''}>
                    <ItemsTable
                      label="Cost of Labour"
                      items={labour}
                      subtotal={labourTotal}
                      {...itemsTableHandlers}
                    />
                  </div>
                )}
                {materials.length === 0 && labour.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-sm">No items found.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Request Timeline */}
          <div className="space-y-2 sm:space-y-3">
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
                            <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[16px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-3 min-w-0">
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">{entry.action.replace('_', ' ')}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">by {entry.actorName}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{formatDate(entry.timestamp, 'long')}</p>
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

        {/* Mobile Item Detail Modal */}
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
                  {[
                    { label: 'Quantity', value: selectedMaterial.quantity },
                    { label: 'Unit', value: selectedMaterial.measurementUnit },
                    { label: 'Rate', value: formatCurrency(selectedMaterial.rateEstimate, false) },
                    { label: 'Amount', value: formatCurrency(selectedMaterial.totalEstimate || selectedMaterial.quantity * selectedMaterial.rateEstimate, false) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-slate-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Status</p>
                  <StatusBadge status={selectedMaterial.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5" />
                </div>
                {selectedMaterial.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button
                      onClick={() => { handleMaterialAction(selectedMaterial.id, 'APPROVED'); setSelectedMaterial(null); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => { setRejectingMaterialId(selectedMaterial.id); setSelectedMaterial(null); }}
                      className="flex-1 h-9"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setSelectedMaterial(null)} className="w-full border-slate-200 mt-2">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RequestDetailsManager;
