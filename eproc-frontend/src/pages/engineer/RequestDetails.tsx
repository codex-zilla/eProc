import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface MaterialItem {
  id: number;
  name: string;
  quantity: number;
  measurementUnit: string;
  rateEstimate: number;
  resourceType: 'MATERIAL' | 'LABOUR';
  status?: string;
  workDescription?: string;
  totalEstimate?: number;
  rateType?: string;
  rejectionComment?: string;
  comment?: string;
  isDuplicate?: boolean;
}

interface BatchDetails {
  id: number;
  title: string;
  additionalDetails?: string;
  status: string;
  projectId: number;
  projectName?: string;
  createdById: number;
  createdByName?: string;
  createdByEmail?: string;
  createdAt: string;
  updatedAt?: string;
  materials: MaterialItem[];
  totalValue: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  priority?: string;
  siteName?: string;
  boqReferenceCode?: string;
}

const MEASUREMENT_UNITS = [
  { value: 'm³', label: 'm³ - Cubic Meter' },
  { value: 'm²', label: 'm² - Square Meter' },
  { value: 'm', label: 'm - Linear Meter' },
  { value: 'kg', label: 'kg - Kilogram' },
  { value: 'ton', label: 'ton - Metric Ton' },
  { value: 'No', label: 'No - Number (count)' },
  { value: 'LS', label: 'LS - Lump Sum' },
  { value: 'bag', label: 'bag - Bag (cement, aggregates)' },
  { value: 'bundle', label: 'bundle - Bundle (reinforcement)' },
  { value: 'trip', label: 'trip - Trip (lorry deliveries)' },
  { value: 'drum', label: 'drum - Drum (bitumen/asphalt)' },
  { value: 'pcs', label: 'pcs - Pieces' },
  { value: 'Days', label: 'Days - Labour duration' },
];

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
 * Batch Details page - view complete BOQ batch with material/labour breakdown.
 */
const BatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<MaterialItem>>({});

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (selectedMaterial && selectedMaterial.status === 'REJECTED') {
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

    setUpdating(true);
    setError(null);
    try {
      await api.patch(`/requests/${batch.id}/materials/${selectedMaterial.id}`, {
        quantity: editValues.quantity,
        measurementUnit: editValues.measurementUnit,
        rateEstimate: editValues.rateEstimate,
        rateType: editValues.rateType
      });

      await loadData();
      setSelectedMaterial(null);
    } catch (err) {
      console.error('Failed to update material:', err);
      setError('Failed to update material details');
    } finally {
      setUpdating(false);
    }
  };




  const loadData = useCallback(async () => {
    try {
      const [batchRes, historyRes] = await Promise.all([
        api.get<BatchDetails>(`/requests/${id}`),
        api.get<AuditEntry[]>(`/requests/${id}/history`).catch(() => ({ data: [] }))
      ]);
      setBatch(batchRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to load batch:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to render duplicate indicator
  const renderDuplicateIndicator = (isDuplicate?: boolean) => {
    if (!isDuplicate) return null;
    return (
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
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      case 'PARTIALLY_APPROVED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'PENDING': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
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



  const calculateTotal = (items: MaterialItem[], type: 'MATERIAL' | 'LABOUR') => {
    return items
      .filter(item => item.resourceType === type)
      .reduce((sum, item) => sum + (item.quantity * item.rateEstimate), 0);
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

  if (!batch || !batch.materials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1">Request not found</p>
          <p className="text-xs sm:text-sm text-slate-500">The request you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link to="/engineer/batches" className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-medium">
          Go back to My Requests
        </Link>
      </div>
    );
  }

  const materials = batch.materials.filter(item => item.resourceType === 'MATERIAL');
  const labour = batch.materials.filter(item => item.resourceType === 'LABOUR');
  const materialTotal = calculateTotal(batch.materials, 'MATERIAL');
  const labourTotal = calculateTotal(batch.materials, 'LABOUR');
  // const grandTotal = materialTotal + labourTotal;
  const pendingCount = (batch.materials || []).filter(m => m.status === 'PENDING').length;

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl mx-auto">


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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            {/* Project Info Card */}
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="p-2 sm:p-3 bg-[#2a3455] rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white tracking-wide">
                  Project: {batch.projectName || 'Project Name'}
                </CardTitle>
              </CardHeader>

              <CardContent className='p-0 space-y-2'>
                {/* Title/Description */}
                <div className="px-3 pt-1 mb-0">
                  <h4 className="font-semibold text-base sm:text-xl text-[#2a3455] tracking-wide">
                    {batch.title || batch.boqReferenceCode || 'BOQ Request'}
                  </h4>
                </div>

                {/* Additional Information/Work Details */}
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

                {/* Status Badges */}
                <div className="px-3 py-1 flex flex-wrap items-center gap-2 tracking-tight">
                  <Badge className={`${getStatusBadgeClass(batch.status)} text-[10px] sm:text-xs px-3 py-1 font-semibold`}>
                    {batch.status}
                  </Badge>
                  {batch.priority === 'HIGH' && (
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
                        {batch.plannedStartDate
                          ? new Date(batch.plannedStartDate).toLocaleDateString()
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Ending</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">
                        {batch.plannedEndDate
                          ? new Date(batch.plannedEndDate).toLocaleDateString()
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Requested By</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">{batch.createdByName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">Created</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="border-t border-slate-200 p-3 pt-1 mb-0 bg-[#fcfcfc]">
                  <p className="text-lg sm:text-xl font-bold text-[#2a3455]">
                    <span className="text-xs sm:text-sm text-slate-600 mb-0 font-semibold pr-2">Total Estimate:</span>
                    <span className='font-mono tracking-tighter'>TZS {(batch.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materials.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedMaterial(item)}>
                              <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                                {item.name}
                                {renderDuplicateIndicator(item.isDuplicate)}
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
                                <Badge className={`${getStatusBadgeClass(item.status || 'PENDING')} text-[10px] px-2 py-0.5`}>
                                  {item.status || 'PENDING'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {materials.map((item) => (
                        <div key={item.id} className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200" onClick={() => setSelectedMaterial(item)}>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 mb-0">
                              Material
                              {renderDuplicateIndicator(item.isDuplicate)}
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
                              <p className="font-semibold text-slate-900">TZS {item.rateEstimate.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Amount</p>
                              <p className="font-semibold text-slate-900">TZS {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-600">Status:</p>
                            <Badge className={`${getStatusBadgeClass(item.status || 'PENDING')} text-[10px] px-2 py-0.5 uppercase font-bold`}>
                              {item.status || 'PENDING'}
                            </Badge>
                          </div>
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labour.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedMaterial(item)}>
                              <TableCell className="px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter">
                                {item.name}
                                {renderDuplicateIndicator(item.isDuplicate)}
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
                                <Badge className={`${getStatusBadgeClass(item.status || 'PENDING')} text-[10px] px-2 py-0.5`}>
                                  {item.status || 'PENDING'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {labour.map((item) => (
                        <div key={item.id} className="bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200" onClick={() => setSelectedMaterial(item)}>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 mb-0">
                              Labour
                              {renderDuplicateIndicator(item.isDuplicate)}
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
                              <p className="font-semibold text-slate-900">TZS {item.rateEstimate.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Amount</p>
                              <p className="font-semibold text-slate-900">TZS {(item.totalEstimate || item.quantity * item.rateEstimate).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-600">Status:</p>
                            <Badge className={`${getStatusBadgeClass(item.status || 'PENDING')} text-[10px] px-2 py-0.5 uppercase font-bold`}>
                              {item.status || 'PENDING'}
                            </Badge>
                          </div>
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

          {/* Material Detail Modal */}
          {selectedMaterial && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMaterial(null)}
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#1e293b] rounded-t-lg">
                  <h3 className="text-base font-semibold text-white">
                    {selectedMaterial.resourceType === 'MATERIAL' ? 'Material' : 'Labour'} Details
                  </h3>
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="text-white hover:text-slate-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedMaterial.name}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${selectedMaterial.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      selectedMaterial.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        selectedMaterial.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      {selectedMaterial.status || 'PENDING'}
                    </span>
                  </div>

                  {/* Rejection Reason - Only for REJECTED */}
                  {selectedMaterial.status === 'REJECTED' && (selectedMaterial.rejectionComment || selectedMaterial.comment) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md text-sm">
                      <p className="font-bold mb-1 text-red-800">Rejection Reason: <span className="font-normal text-red-700">{selectedMaterial.rejectionComment || selectedMaterial.comment}</span></p>
                    </div>
                  )}

                  {/* Error Message in Modal */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Rate Type Display (Always visible, editable if rejected) */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1">Rate Type</h4>
                    {selectedMaterial.status === 'REJECTED' ? (
                      <p className="text-sm text-slate-600">
                        {editValues.rateType === 'MARKET_RATE' ? 'Market Rate' : 'Engineer Estimate'}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600">
                        {selectedMaterial.rateType === 'MARKET_RATE' ? 'Market Rate' : 'Engineer Estimate'}
                      </p>
                    )}
                  </div>


                  {/* Editable Fields for REJECTED, Read-only for others */}
                  {selectedMaterial.status === 'REJECTED' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                          <input
                            type="number"
                            value={editValues.quantity || ''}
                            onChange={(e) => setEditValues({ ...editValues, quantity: parseFloat(e.target.value) })}
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                          <Select
                            value={editValues.measurementUnit}
                            onValueChange={(val) => setEditValues({ ...editValues, measurementUnit: val })}
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
                            onChange={(e) => setEditValues({ ...editValues, rateEstimate: parseFloat(e.target.value) })}
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                          <div className="w-full text-sm bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-700 font-medium">
                            {((editValues.quantity || 0) * (editValues.rateEstimate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                            {selectedMaterial.quantity.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                          <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                            {selectedMaterial.measurementUnit}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (TZS)</label>
                          <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                            {selectedMaterial.rateEstimate.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                          <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-slate-50 font-medium">
                            {(selectedMaterial.quantity * selectedMaterial.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedMaterial.workDescription && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-slate-700">{selectedMaterial.workDescription}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg flex gap-3">
                  {selectedMaterial.status === 'REJECTED' ? (
                    <>
                      <Button
                        className="flex-1 bg-[#1e293b] hover:bg-[#0f172a] text-white"
                        onClick={handleUpdateMaterial}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Update Material'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-24 border-slate-300 text-slate-700 hover:bg-slate-50"
                        onClick={() => setSelectedMaterial(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedMaterial(null)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Right Column - Request Timeline */}
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
                            {getActionIcon(entry.action)}
                          </div>
                          {index < history.length - 1 && (
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

            {/* Related Documents Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#2a3455] text-white p-2 sm:p-3 rounded-t-lg border-b border-slate-200">
                <CardTitle className="text-sm sm:text-base font-semibold tracking-wide">Related Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 text-center py-4">No documents attached</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-10 text-sm font-medium"
                  >
                    View in Context
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BatchDetails;
