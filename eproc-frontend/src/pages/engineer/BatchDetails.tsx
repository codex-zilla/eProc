import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface MaterialItem {
  id: number;
  name: string;
  quantity: number;
  measurementUnit: string;
  rateEstimate: number;
  resourceType: 'MATERIAL' | 'LABOUR';
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

/**
 * Batch Details page - view complete BOQ batch with material/labour breakdown.
 */
const BatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await api.get<BatchDetails>(`/requests/${id}`);
      setBatch(response.data);
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
            {batch.additionalDetails && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{batch.additionalDetails}</p>
            )}
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
          {/* Cost of Materials */}
          {materials.length > 0 && (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white">1. Cost of Materials</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Sl no</th>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Material</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Quantity</th>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Unit</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Rate(Rs)</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Amount(Rs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 sm:p-4 text-slate-900">{index + 1}</td>
                          <td className="p-3 sm:p-4 text-slate-900 font-medium">
                            {item.name}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900">
                            {item.quantity.toFixed(2)}
                          </td>
                          <td className="p-3 sm:p-4 text-slate-900">
                            {item.measurementUnit}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900">
                            {item.rateEstimate.toLocaleString()}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900 font-medium">
                            {(item.quantity * item.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-300 bg-blue-50">
                      <tr>
                        <td colSpan={5} className="p-3 sm:p-4 text-right font-bold text-slate-900">Total=</td>
                        <td className="p-3 sm:p-4 text-right font-bold text-blue-900">
                          {materialTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost of Labour */}
          {labour.length > 0 && (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 rounded-t-lg">
                <CardTitle className="text-sm sm:text-base text-white">2. Cost of Labour</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Sl no</th>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Material</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Quantity</th>
                        <th className="text-left p-3 sm:p-4 font-semibold text-slate-700">Unit</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Rate(Rs)</th>
                        <th className="text-right p-3 sm:p-4 font-semibold text-slate-700">Amount(Rs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labour.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="p-3 sm:p-4 text-slate-900">{index + 1}</td>
                          <td className="p-3 sm:p-4 text-slate-900 font-medium">
                            {item.name}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900">
                            {item.quantity.toFixed(2)}
                          </td>
                          <td className="p-3 sm:p-4 text-slate-900">
                            {item.measurementUnit}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900">
                            {item.rateEstimate.toLocaleString()}
                          </td>
                          <td className="p-3 sm:p-4 text-right text-slate-900 font-medium">
                            {(item.quantity * item.rateEstimate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-300 bg-green-50">
                      <tr>
                        <td colSpan={5} className="p-3 sm:p-4 text-right font-bold text-slate-900">Total=</td>
                        <td className="p-3 sm:p-4 text-right font-bold text-green-900">
                          {labourTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grand Total */}
          <Card className="border-amber-200 shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base pb-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">1. Cost of materials + 2. Cost of Labour</span>
                  <span className="font-bold text-slate-900">
                    = {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-amber-900">Net Total</h3>
                    <p className="text-lg sm:text-2xl font-bold text-amber-900">
                      Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Request Information */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {batch.siteName && (
                  <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Site:</span>
                    <span className="text-xs sm:text-sm text-slate-900 font-semibold">{batch.siteName}</span>
                  </div>
                )}
                
                {batch.plannedStartDate && batch.plannedEndDate && (
                  <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Timeline:</span>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-900 font-semibold">
                      {new Date(batch.plannedStartDate).toLocaleDateString()} - {new Date(batch.plannedEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2 sm:py-3">
                  <span className="text-xs sm:text-sm font-medium text-slate-700">Priority:</span>
                  <Badge variant={batch.priority === 'HIGH' ? "destructive" : "secondary"} className="text-[10px] sm:text-xs">
                    {batch.priority || 'NORMAL'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Created By */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
              <CardTitle className="text-sm sm:text-base text-white">Created By</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {batch.createdByName && (
                  <p className="text-sm font-semibold text-slate-900">{batch.createdByName}</p>
                )}
                {batch.createdByEmail && (
                  <p className="text-xs text-slate-600">{batch.createdByEmail}</p>
                )}
                <p className="text-xs text-slate-500">
                  {new Date(batch.createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;
