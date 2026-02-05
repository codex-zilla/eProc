import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';

interface BatchSummary {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PARTIALLY_APPROVED' | 'APPROVED' | 'REJECTED';
  itemCount: number;
  totalValue: number;
  createdAt: string;
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-300',
  PARTIALLY_APPROVED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * My Batches page for Engineers.
 * Shows a list of all batch requests submitted by the engineer.
 */
const MyBatches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await api.get<BatchSummary[]>('/boq-batches/my-batches');
        setBatches(response.data);
      } catch (err: any) {
        console.error('Failed to load batches:', err);
        setError(err.response?.data?.message || 'Failed to load batches');
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Batches</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">View and manage your batch requests</p>
        </div>
        <Button
          onClick={() => navigate('/engineer/create-batch')}
          className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Batch
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {batches.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">No batches yet</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Create your first batch request to get started
                </p>
              </div>
              <Button
                onClick={() => navigate('/engineer/create-batch')}
                className="bg-green-600 hover:bg-green-700 text-white mt-2 h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start sm:items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900">{batch.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_COLORS[batch.status]
                        }`}
                      >
                        {batch.status.replace('_', ' ')}
                      </span>
                    </div>
                    {batch.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{batch.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-500">
                      <span>{batch.itemCount} item(s)</span>
                      <span className="font-semibold text-slate-700">
                        TZS {batch.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/engineer/batches/${batch.id}`)}
                      className="h-8 text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBatches;
