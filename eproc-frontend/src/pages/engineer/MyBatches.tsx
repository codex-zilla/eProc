import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, FileText } from 'lucide-react';

interface BatchSummary {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PARTIALLY_APPROVED' | 'APPROVED' | 'REJECTED';
  siteName?: string;
  plannedStartDate?: string;
  totalValue: number;
  createdAt: string;
}

/**
 * My Batches page for Engineers - displays BOQ requests in table format.
 */
const MyBatches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await api.get<BatchSummary[]>('/boq-batches/my-batches');
        setBatches(response.data);
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  const filteredBatches = batches.filter(b => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'PARTIALLY_APPROVED':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const handleRowClick = (batchId: number) => {
    navigate(`/engineer/batches/${batchId}`);
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
        {['ALL', 'SUBMITTED', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-0.5 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-sm font-semibold whitespace-nowrap transition-colors flex flex-col items-center justify-center sm:flex-row ${
              filter === status 
                ? 'bg-[#2a3455] text-white rounded-t-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{status.replace('_', ' ')}</span>
            <span className="sm:ml-2 text-[9px] sm:text-xs font-medium opacity-80">
              ({status === 'ALL' 
                ? batches.length 
                : batches.filter(b => b.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredBatches.length === 0 ? (
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
                    : `No ${filter.toLowerCase().replace('_', ' ')} requests.`}
                </p>
                {filter === 'ALL' && (
                  <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white h-9 sm:h-10 text-xs sm:text-sm shadow-sm">
                    <Link to="/engineer/create-batch" className="flex items-center gap-1.5 sm:gap-2">
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
                <TableHeader className="bg-[#2a3455] rounded-t-lg">
                  <TableRow>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Request Name</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Site</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Date</TableHead>
                    <TableHead className="font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Status</TableHead>
                    <TableHead className="text-right font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map(batch => (
                    <TableRow 
                      key={batch.id} 
                      onClick={() => handleRowClick(batch.id)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-slate-900 text-xs sm:text-sm">
                            {batch.title || batch.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {batch.siteName || 'Multiple Sites'}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                        {batch.plannedStartDate 
                          ? new Date(batch.plannedStartDate).toLocaleDateString()
                          : new Date(batch.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3">
                        <Badge className={`${getStatusBadgeClass(batch.status)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                          {batch.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-right text-xs sm:text-sm text-slate-900 font-medium">
                        TZS {batch.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild 
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm h-7 sm:h-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/engineer/batches/${batch.id}`}>
                            View
                          </Link>
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
            {filteredBatches.map(batch => (
              <Card 
                key={batch.id} 
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRowClick(batch.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {batch.title || batch.description}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {batch.siteName ? `Site: ${batch.siteName}` : 'Multiple Sites'}
                      </p>
                    </div>
                    <Badge className={`${getStatusBadgeClass(batch.status)} text-[10px] px-1.5 py-0.5 flex-shrink-0`}>
                      {batch.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>
                        <span className="font-medium text-slate-900">
                          TZS {batch.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {batch.plannedStartDate 
                          ? new Date(batch.plannedStartDate).toLocaleDateString()
                          : new Date(batch.createdAt).toLocaleDateString()}
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

export default MyBatches;
