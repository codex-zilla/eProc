import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, FileText } from 'lucide-react';

interface MaterialRequest {
  id: number;
  siteName: string;
  materialName?: string;
  manualMaterialName?: string;
  quantity: number;
  status: string;
  emergencyFlag: boolean;
  rejectionComment?: string;
  createdAt: string;
}

/**
 * My Requests page - list of engineer's own requests.
 */
const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await api.get<MaterialRequest[]>('/requests/my');
        setRequests(response.data);
      } catch (err) {
        console.error('Failed to load requests:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const handleRowClick = (requestId: number) => {
    navigate(`/engineer/requests/${requestId}`);
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
      {/* Filter Tabs */}
      <div className="flex justify-between gap-0.5 sm:gap-2 border-b border-slate-200 overflow-x-hidden">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-0.5 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-sm font-semibold whitespace-nowrap transition-colors flex flex-col items-center justify-center sm:flex-row ${
              filter === status 
                ? 'bg-[#2a3455] text-white rounded-t-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{status}</span>
            <span className="sm:ml-2 text-[9px] sm:text-xs font-medium opacity-80">
              ({status === 'ALL' 
                ? requests.length 
                : requests.filter(r => r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">No requests found</h3>
                <p className="text-sm sm:text-base text-slate-500 mb-3 sm:mb-4">
                  {filter === 'ALL' 
                    ? "You haven't created any requests yet." 
                    : `No ${filter.toLowerCase()} requests.`}
                </p>
                {filter === 'ALL' && (
                  <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white h-9 sm:h-10 text-xs sm:text-sm shadow-sm">
                    <Link to="/engineer/requests/new" className="flex items-center gap-1.5 sm:gap-2">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Create Your First Request
                    </Link>
                  </Button>
                )}
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
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Material</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Site</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Quantity</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Date</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(request => (
                    <TableRow 
                      key={request.id} 
                      onClick={() => handleRowClick(request.id)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-slate-900 text-xs sm:text-sm">
                            {request.materialName || request.manualMaterialName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">{request.siteName}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 font-medium">{request.quantity}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3">
                        <Badge className={`${getStatusBadgeClass(request.status)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm h-7 sm:h-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link to={`/engineer/requests/${request.id}`}>
                              View
                            </Link>
                          </Button>
                          {request.status === 'REJECTED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild 
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs sm:text-sm h-7 sm:h-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link to={`/engineer/requests/${request.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {filteredRequests.map(request => (
              <Card 
                key={request.id} 
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRowClick(request.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {request.emergencyFlag && (
                          <span title="Emergency" className="text-sm">🚨</span>
                        )}
                        <h3 className="font-semibold text-sm text-slate-900 truncate">
                          {request.materialName || request.manualMaterialName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">Site: {request.siteName}</p>
                    </div>
                    <Badge className={`${getStatusBadgeClass(request.status)} text-[10px] px-1.5 py-0.5 flex-shrink-0`}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span><span className="font-medium text-slate-900">{request.quantity}</span> units</span>
                      <span className="text-slate-400">•</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    {request.status === 'REJECTED' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild 
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs h-7 px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/engineer/requests/${request.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rejection Comments Notice */}
          {filteredRequests.some(r => r.status === 'REJECTED' && r.rejectionComment) && (
            <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 mb-2 sm:mb-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-sm sm:text-base text-yellow-900">Rejected Requests - Action Required</h3>
                </div>
                <div className="space-y-2">
                  {filteredRequests
                    .filter(r => r.status === 'REJECTED' && r.rejectionComment)
                    .map(r => (
                      <div key={r.id} className="bg-white rounded-md p-2 sm:p-3 border border-yellow-200">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-xs sm:text-sm text-slate-900">
                            {r.materialName || r.manualMaterialName}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild 
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs h-7 px-2 flex-shrink-0"
                          >
                            <Link to={`/engineer/requests/${r.id}/edit`}>
                              Edit & Resubmit
                            </Link>
                          </Button>
                        </div>
                        <p className="text-xs sm:text-sm text-yellow-800 italic">
                          <span className="font-medium not-italic">Reason:</span> {r.rejectionComment}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MyRequests;
