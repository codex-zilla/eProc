import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequest, useRequestHistory, useUpdateMaterial } from '@/hooks/queries/useRequests';
import type { RequestItem } from '@/types/models';
import { MaterialUnit } from '@/types/models';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  Calendar,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  RotateCw,
  X,
  User,
  Clock,
  AlertOctagon,
  AlertTriangle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { formatDate, formatCurrency, formatNumber, formatDateTime } from '../../lib/formatters';

const MEASUREMENT_UNITS = Object.values(MaterialUnit).map(unit => ({ value: unit, label: unit }));

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Small warning icon shown next to duplicate materials in the table. */
const DuplicateIndicator = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex ml-2 align-middle cursor-help">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      </span>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Duplicate Material</p>
    </TooltipContent>
  </Tooltip>
);

/** Returns an icon for a given history action string. */
const ActionIcon = ({ action }: { action: string }) => {
  switch (action) {
    case 'CREATED': return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2a3455]" />;
    case 'SUBMITTED': return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />;
    case 'APPROVED':
    case 'MATERIAL_APPROVED': return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
    case 'REJECTED':
    case 'MATERIAL_REJECTED': return <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
    case 'UPDATED': return <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />;
    case 'RESUBMITTED': return <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />;
    default: return <div className="h-2 w-2 rounded-full bg-slate-300" />;
  }
};

interface ItemsTableProps {
  items: RequestItem[];
  label: string;
  subtotal: number;
  onSelectItem: (item: RequestItem) => void;
}

/** Renders a desktop table + mobile card list for a given resource type. */
const ItemsTable = ({ items, label, subtotal, onSelectItem }: ItemsTableProps) => (
  <div className="border-b border-slate-200">
    <h3 className="text-sm font-semibold text-[#2a3455] px-2 py-3 border-b border-slate-100 bg-slate-50">
      {label}
    </h3>

    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-slate-100 border-b border-slate-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2">Item</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Qty</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Unit</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right hidden lg:table-cell">Rate (TZS)</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right">Amount (TZS)</TableHead>
            <TableHead className="text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onSelectItem(item)}
            >
              <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                {item.name}
                {item.isDuplicate && <DuplicateIndicator />}
              </TableCell>
              <TableCell className="px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter">
                {item.quantity}
              </TableCell>
              <TableCell className="px-2 py-2.5 text-center text-sm text-slate-600 tracking-tighter">
                {item.measurementUnit}
              </TableCell>
              <TableCell className="px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell tracking-tighter">
                {formatNumber(item.rateEstimate)}
              </TableCell>
              <TableCell className="px-2 py-2.5 text-right text-sm font-medium font-mono text-slate-700 tracking-tighter">
                {formatNumber(item.totalEstimate ?? item.quantity * item.rateEstimate)}
              </TableCell>
              <TableCell className="px-2 py-2.5 text-center tracking-tighter">
                <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Mobile Cards */}
    <div className="md:hidden space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200"
          onClick={() => onSelectItem(item)}
        >
          <div className="space-y-1">
            <p className="text-xs text-slate-600 mb-0">
              {label}
              {item.isDuplicate && <DuplicateIndicator />}
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
              <p className="font-semibold text-slate-900">{formatCurrency(item.rateEstimate)}</p>
            </div>
            <div>
              <p className="text-slate-600">Amount</p>
              <p className="font-semibold text-slate-900">{formatCurrency(item.totalEstimate ?? item.quantity * item.rateEstimate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-600">Status:</p>
            <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5 uppercase font-bold" />
          </div>
        </div>
      ))}
    </div>

    {/* Subtotal */}
    <div className="bg-slate-50 px-2 py-2 justify-end border-t border-slate-200 hidden md:flex">
      <span className="text-sm font-medium text-slate-600 me-3">{label} Subtotal:</span>
      <span className="text-sm font-bold font-mono text-slate-900 pe-2 tracking-tighter">{formatCurrency(subtotal)}</span>
    </div>
  </div>
);

interface ItemDetailModalProps {
  item: RequestItem;
  editValues: Partial<RequestItem>;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onEditChange: (values: Partial<RequestItem>) => void;
}

/** Modal dialog for viewing / editing a single material or labour item. */
const ItemDetailModal = ({ item, editValues, isSaving, onClose, onSave, onEditChange }: ItemDetailModalProps) => {
  const isRejected = item.status === 'REJECTED';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#1e293b] rounded-t-lg">
          <h3 className="text-base font-semibold text-white">
            {item.resourceType === 'MATERIAL' ? 'Material' : 'Labour'} Details
          </h3>
          <button onClick={onClose} className="text-white hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Name + Status */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</h4>
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
            </div>
            <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] font-bold uppercase tracking-wide" />
          </div>

          {/* Rejection Reason */}
          {isRejected && (item.rejectionComment || item.comment) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md text-sm">
              <p className="font-bold mb-1 text-red-800">
                Rejection Reason:{' '}
                <span className="font-normal text-red-700">{item.rejectionComment || item.comment}</span>
              </p>
            </div>
          )}

          {/* Rate Type */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-1">Rate Type</h4>
            <p className="text-sm text-slate-600">
              {(isRejected ? editValues.rateType : item.rateType) === 'MARKET_RATE'
                ? 'Market Rate'
                : 'Engineer Estimate'}
            </p>
          </div>

          {/* Fields */}
          {isRejected ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={editValues.quantity || ''}
                    onChange={(e) => onEditChange({ ...editValues, quantity: parseFloat(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                  <Select
                    value={editValues.measurementUnit}
                    onValueChange={(val) => onEditChange({ ...editValues, measurementUnit: val })}
                  >
                    <SelectTrigger className="w-full text-sm border-slate-300 h-[38px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value} className="text-xs">
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (TZS)</label>
                  <input
                    type="number"
                    value={editValues.rateEstimate || ''}
                    onChange={(e) => onEditChange({ ...editValues, rateEstimate: parseFloat(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                  <div className="w-full text-sm bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-700 font-medium">
                    {formatNumber(((editValues.quantity || 0) * (editValues.rateEstimate || 0)), 2)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                  <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                    {item.quantity.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                  <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                    {item.measurementUnit}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (TZS)</label>
                  <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                    {formatNumber(item.rateEstimate)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                  <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-slate-50 font-medium">
                    {formatNumber(item.quantity * item.rateEstimate, 2)}
                  </div>
                </div>
              </div>
            </>
          )}

          {item.workDescription && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-sm text-slate-700">{item.workDescription}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg flex gap-3">
          {isRejected ? (
            <>
              <Button
                className="flex-1 bg-[#1e293b] hover:bg-[#0f172a] text-white"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? 'Updating...' : 'Update Material'}
              </Button>
              <Button
                variant="outline"
                className="w-24 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={onClose}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────────

/**
 * Request Details page - view complete BOQ batch with material/labour breakdown.
 */
const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const requestId = id ? parseInt(id) : 0;

  const { data: batch, isLoading, error: batchError } = useRequest(requestId);
  const { data: history = [] } = useRequestHistory(requestId);
  const updateMaterialMutation = useUpdateMaterial();

  const [selectedMaterial, setSelectedMaterial] = useState<RequestItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<RequestItem>>({});

  const error = batchError
    ? batchError instanceof Error ? batchError.message : 'Failed to load request details'
    : null;

  useEffect(() => {
    if (selectedMaterial?.status === 'REJECTED') {
      setEditValues({
        quantity: selectedMaterial.quantity,
        measurementUnit: selectedMaterial.measurementUnit,
        rateEstimate: selectedMaterial.rateEstimate,
        rateType: selectedMaterial.rateType || 'ENGINEER_ESTIMATE'
      });
    } else {
      setEditValues({});
    }
  }, [selectedMaterial]);

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial || !batch) return;
    try {
      await updateMaterialMutation.mutateAsync({
        requestId: batch.id,
        materialId: selectedMaterial.id,
        data: {
          quantity: editValues.quantity,
          measurementUnit: editValues.measurementUnit,
          rateEstimate: editValues.rateEstimate,
          rateType: editValues.rateType
        }
      });
      toast.success('Material updated successfully');
      setSelectedMaterial(null);
    } catch {
      // Error handled by the mutation hook
    }
  };

  const calculateTotal = (items: RequestItem[], type: 'MATERIAL' | 'LABOUR') =>
    items.filter(i => i.resourceType === type).reduce((sum, i) => sum + i.quantity * i.rateEstimate, 0);

  // ── Loading / Error / Empty guards ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading request..." />
      </div>
    );
  }

  if (batchError) {
    return <ErrorDisplay error={batchError instanceof Error ? batchError : new Error(error || 'Failed to load')} className="min-h-[50vh]" />;
  }

  if (!batch || !batch.materials) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Request not found"
        description="The request you're looking for doesn't exist or has been removed."
        action={
          <Link
            to="/engineer/batches"
            className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-medium"
          >
            Go back to My Requests
          </Link>
        }
        className="min-h-[50vh]"
      />
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const materials = batch.materials.filter(i => i.resourceType === 'MATERIAL');
  const labour = batch.materials.filter(i => i.resourceType === 'LABOUR');
  const materialTotal = calculateTotal(batch.materials, 'MATERIAL');
  const labourTotal = calculateTotal(batch.materials, 'LABOUR');
  const pendingCount = batch.materials.filter(m => m.status === 'PENDING').length;

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">

            {/* Project Info Card */}
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="p-2 sm:p-3 bg-[#2a3455] rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white tracking-wide">
                  Project: {batch.projectName || 'Project Name'}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 space-y-2">
                {/* Title */}
                <div className="px-3 pt-1 mb-0">
                  <h4 className="font-semibold text-base sm:text-xl text-[#2a3455] tracking-wide">
                    {batch.title || batch.boqReferenceCode || 'BOQ Request'}
                  </h4>
                </div>

                {/* Additional Details */}
                {batch.additionalDetails && (
                  <div className="px-3 mb-1">
                    <p className="text-xs sm:text-sm text-[#2a3455]">{batch.additionalDetails}</p>
                    {batch.siteName && (
                      <p className="text-xs sm:text-sm text-[#2a3455]">
                        Site: <span className="font-normal uppercase tracking-tighter">{batch.siteName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Status / Priority Badges */}
                <div className="px-3 py-1 flex flex-wrap items-center gap-2 tracking-tight">
                  <StatusBadge status={batch.status} type="request" className="text-[10px] sm:text-xs px-3 py-1 font-semibold" />
                  {batch.priority === 'HIGH' && (
                    <Badge variant="destructive" className="text-[10px] sm:text-xs px-3 py-1 font-semibold">
                      <AlertOctagon className="h-3 w-3 mr-1" />
                      HIGH PRIORITY
                    </Badge>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 pt-1 bg-[#fefefe]">
                  {[
                    { icon: Calendar, label: 'Starting', value: batch.plannedStartDate ? formatDate(batch.plannedStartDate) : 'Not specified' },
                    { icon: Calendar, label: 'Ending', value: batch.plannedEndDate ? formatDate(batch.plannedEndDate) : 'Not specified' },
                    { icon: User, label: 'Requested By', value: batch.createdByName },
                    { icon: Clock, label: 'Created', value: formatDate(batch.createdAt) },
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
                    <span className="font-mono tracking-tighter">{formatCurrency(batch.totalValue || 0)}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
                    Status:{' '}
                    <span className="font-bold text-yellow-400">
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
                    items={materials}
                    label="Cost of Materials"
                    subtotal={materialTotal}
                    onSelectItem={setSelectedMaterial}
                  />
                )}
                {labour.length > 0 && (
                  <div className={materials.length > 0 ? 'mt-5' : undefined}>
                    <ItemsTable
                      items={labour}
                      label="Cost of Labour"
                      subtotal={labourTotal}
                      onSelectItem={setSelectedMaterial}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Item Detail Modal ──────────────────────────────────────── */}
          {selectedMaterial && (
            <ItemDetailModal
              item={selectedMaterial}
              editValues={editValues}
              isSaving={updateMaterialMutation.isPending}
              onClose={() => setSelectedMaterial(null)}
              onSave={handleUpdateMaterial}
              onEditChange={setEditValues}
            />
          )}

          {/* ── Right Column ─────────────────────────────────────────────── */}
          <div className="space-y-2 sm:space-y-3">

            {/* Request Timeline */}
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
                    {history.map((entry, index) => (
                      <div key={entry.id} className="flex gap-2">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-6 h-6 bg-[#2a3455]/10 rounded-full flex items-center justify-center">
                            <ActionIcon action={entry.action} />
                          </div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[16px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-3 min-w-0">
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {entry.action.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500">by {entry.actorName}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{formatDateTime(entry.timestamp)}</p>
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

            {/* Related Documents */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#2a3455] text-white p-2 sm:p-3 rounded-t-lg border-b border-slate-200">
                <CardTitle className="text-sm sm:text-base font-semibold tracking-wide">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 text-center py-4">No documents attached</p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-10 text-sm font-medium"
                >
                  View in Context
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RequestDetails;
