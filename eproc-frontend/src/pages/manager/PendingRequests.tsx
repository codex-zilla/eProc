import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, FileText, Clock } from 'lucide-react';

interface PendingRequest {
  id: number;
  title: string;
  additionalDetails?: string;
  siteName?: string;
  status: string;
  totalValue: number;
  createdAt: string;
  createdByName?: string;
  plannedStartDate?: string;
  priority?: string;
}

/**
 * Pending Requests page - approval queue for Project Owner.
 * Displays submitted requests in table format matching engineer's Requests.tsx
 */
const PendingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleRowClick = (requestId: number) => {
    navigate(`/manager/requests/${requestId}`);
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

      {/* Summary Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs sm:text-sm px-2 sm:px-3 py-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            {requests.length} Pending
          </Badge>
        </div>
      </div>

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
        <>
          {/* Desktop Table View */}
          <Card className="border-slate-200 shadow-sm hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#2a3455] rounded-t-lg">
                  <TableRow>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Request Name</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Site</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Requested By</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Date</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Priority</TableHead>
                    <TableHead className="text-right font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(request => (
                    <TableRow 
                      key={request.id} 
                      onClick={() => handleRowClick(request.id)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-slate-900 text-xs sm:text-sm">
                            {request.title || request.additionalDetails || 'BOQ Request'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {request.siteName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {request.createdByName || 'Unknown'}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {request.plannedStartDate 
                          ? new Date(request.plannedStartDate).toLocaleDateString()
                          : new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3">
                        {request.priority && (
                          <Badge className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
                            request.priority === 'HIGH' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {request.priority}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-right text-xs sm:text-sm text-slate-900 font-medium">
                        TZS {request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm h-7 sm:h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(request.id);
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {requests.map(request => (
              <Card 
                key={request.id} 
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRowClick(request.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {request.title || request.additionalDetails || 'BOQ Request'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {request.siteName ? `Site: ${request.siteName}` : 'No site specified'}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      PENDING
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>
                        <span className="font-medium text-slate-900">
                          TZS {request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {request.plannedStartDate 
                          ? new Date(request.plannedStartDate).toLocaleDateString()
                          : new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PendingRequests;
