import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Calendar,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  RotateCw,
  FileDown,
  X
} from 'lucide-react';

interface MaterialItem {
  id: number;
  name: string;
  quantity: number;
  measurementUnit: string;
  rateEstimate: number;
  resourceType: 'MATERIAL' | 'LABOUR';
  status?: string;
  workDescription?: string;
}

interface BatchDetails {
  id: number;
  title: string;
  additionalDetails?: string;
  status: string;
  projectId: number;
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
 * Batch Details page - view complete BOQ batch with material/labour breakdown.
 */
const BatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);


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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'PARTIALLY_APPROVED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
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
      case 'CREATED': return 'bg-slate-100';
      default: return 'bg-slate-100';
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
  const grandTotal = materialTotal + labourTotal;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-1">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between w-full gap-3 flex-wrap mb-1.5 sm:mb-2">
              <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-slate-900">
                {batch.title}
              </h1>
              <Badge className={`${getStatusBadgeClass(batch.status)} lg:hidden text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 font-semibold uppercase me-2`}>
                {batch.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <Badge className={`${getStatusBadgeClass(batch.status)} hidden lg:inline-flex text-xs px-3 py-1 font-semibold uppercase me-2`}>
            {batch.status.replace('_', ' ')}
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
          {/* Request Details Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {batch.siteName && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site</h4>
                    <p className="text-sm font-medium text-slate-900">{batch.siteName}</p>
                  </div>
                )}

                {batch.plannedStartDate && batch.plannedEndDate && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Timeline</h4>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {new Date(batch.plannedStartDate).toLocaleDateString()} - {new Date(batch.plannedEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {batch.priority && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</h4>
                    <div className="flex items-center gap-2">
                       <div className={`h-2 w-2 rounded-full ${batch.priority === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`} />
                       <span className="text-sm font-medium text-slate-900 capitalize">{batch.priority.toLowerCase()}</span>
                    </div>
                  </div>
                )}
              </div>

              {batch.additionalDetails && (
                <div className="mb-8">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Details</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {batch.additionalDetails}
                  </p>
                </div>
              )}
              
              <div className="pt-6 border-t border-slate-100">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Estimate</h3>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    <span className="text-lg font-medium text-slate-500 mr-2">TZS</span>
                    {batch.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Breakdown Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Material Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Cost of Materials Section */}
              {materials.length > 0 && (
                <div className="border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#2a3455] px-4 py-3 border-b border-slate-100 bg-slate-50">
                    1. Cost of Materials
                  </h3>
                  <div>
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-600">Material</th>
                          <th className="text-right p-3 font-semibold text-slate-600 hidden sm:table-cell">Quantity</th>
                          <th className="text-left p-3 font-semibold text-slate-600 hidden sm:table-cell">Unit</th>
                          <th className="text-right p-3 font-semibold text-slate-600 hidden sm:table-cell">Rate (TZS)</th>
                          <th className="text-right p-3 font-semibold text-slate-600">Amount</th>
                          <th className="text-center p-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((item) => (
                          <tr 
                            key={item.id} 
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedMaterial(item)}
                          >
                            <td className="p-3 text-slate-900 font-medium">{item.name}</td>
                            <td className="p-3 text-right text-slate-900 hidden sm:table-cell">{item.quantity.toFixed(2)}</td>
                            <td className="p-3 text-slate-600 hidden sm:table-cell">{item.measurementUnit}</td>
                            <td className="p-3 text-right text-slate-900 hidden sm:table-cell">{item.rateEstimate.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-900 font-medium">
                              {(item.quantity * item.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50">
                          <td colSpan={1} className="p-3 text-right font-semibold text-slate-700 sm:hidden">Total =</td>
                          <td colSpan={4} className="p-3 text-right font-semibold text-slate-700 hidden sm:table-cell">Total =</td>
                          <td className="p-3 text-right font-bold text-[#2a3455]">
                            {materialTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Cost of Labour Section */}
              {labour.length > 0 && (
                <div className="border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#2a3455] px-4 py-3 border-b border-slate-100 bg-slate-50">
                    2. Cost of Labour
                  </h3>
                  <div>
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-600">Labour</th>
                          <th className="text-right p-3 font-semibold text-slate-600 hidden sm:table-cell">Quantity</th>
                          <th className="text-left p-3 font-semibold text-slate-600 hidden sm:table-cell">Unit</th>
                          <th className="text-right p-3 font-semibold text-slate-600 hidden sm:table-cell">Rate (TZS)</th>
                          <th className="text-right p-3 font-semibold text-slate-600">Amount</th>
                          <th className="text-center p-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labour.map((item) => (
                          <tr 
                            key={item.id} 
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedMaterial(item)}
                          >
                            <td className="p-3 text-slate-900 font-medium">{item.name}</td>
                            <td className="p-3 text-right text-slate-900 hidden sm:table-cell">{item.quantity.toFixed(2)}</td>
                            <td className="p-3 text-slate-600 hidden sm:table-cell">{item.measurementUnit}</td>
                            <td className="p-3 text-right text-slate-900 hidden sm:table-cell">{item.rateEstimate.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-900 font-medium">
                              {(item.quantity * item.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50">
                          <td colSpan={1} className="p-3 text-right font-semibold text-slate-700 sm:hidden">Total =</td>
                          <td colSpan={4} className="p-3 text-right font-semibold text-slate-700 hidden sm:table-cell">Total =</td>
                          <td className="p-3 text-right font-bold text-[#2a3455]">
                            {labourTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#2a3455] rounded-t-lg">
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
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</h4>
                    <p className="text-sm font-medium text-slate-900">{selectedMaterial.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Quantity</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedMaterial.quantity.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedMaterial.measurementUnit}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rate (TZS)</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedMaterial.rateEstimate.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Amount (TZS)</h4>
                      <p className="text-sm font-bold text-[#2a3455]">
                        {(selectedMaterial.quantity * selectedMaterial.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                      selectedMaterial.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      selectedMaterial.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      selectedMaterial.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedMaterial.status || 'PENDING'}
                    </span>
                  </div>
                  
                  {selectedMaterial.workDescription && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-slate-700">{selectedMaterial.workDescription}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedMaterial(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                             entry.action === 'RESUBMITTED' ? 'Rev 2: Resubmitted' :
                             entry.action === 'APPROVED' ? 'Rev 2: Approved' :
                             entry.action === 'REJECTED' ? 'Rev 1: Rejected' :
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
  );
};

export default BatchDetails;
