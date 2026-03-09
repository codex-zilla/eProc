import { Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { Textarea } from '@/components/ui/textarea';
import { X, Check, AlertCircle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

import { useManagerRequestDetails } from '@/hooks/useManagerRequestDetails';
import { RequestMetadataCard } from '@/components/domain/requests/details/RequestMetadataCard';
import { RequestTimeline } from '@/components/domain/requests/details/RequestTimeline';
import { MaterialItemsTable } from '@/components/domain/requests/details/MaterialItemsTable';
import type { RequestItem } from '@/types/models';

const RequestDetailsManager = () => {
  const { id } = useParams<{ id: string }>();
  const requestId = id ? parseInt(id) : 0;

  const {
    request,
    history,
    isLoading,
    error,
    materials,
    labour,
    materialTotal,
    labourTotal,
    pendingCount,
    rejectComment,
    setRejectComment,
    rejectingMaterialId,
    processingMaterialId,
    handlers: { onApprove, onStartReject, onConfirmReject, onCancelReject },
  } = useManagerRequestDetails(requestId);

  // ── Loading / Error / Empty guards ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading request details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={new Error(error)} className="min-h-[50vh]" />;
  }

  if (!request || !request.materials) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Request not found"
        description="The request you're looking for doesn't exist or has been removed."
        action={
          <Link
            to="/manager/requests"
            className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-medium"
          >
            Go back to Requests
          </Link>
        }
        className="min-h-[50vh]"
      />
    );
  }

  const renderManagerActions = (item: RequestItem) => {
    if (item.status !== 'PENDING') return null;

    if (rejectingMaterialId === item.id) {
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            className="min-h-[60px] text-xs resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onCancelReject()}
              disabled={processingMaterialId === item.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onConfirmReject(item.id)}
              disabled={!rejectComment.trim() || processingMaterialId === item.id}
            >
              {processingMaterialId === item.id ? 'Loading...' : 'Confirm'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          onClick={() => onApprove(item.id)}
          disabled={processingMaterialId === item.id}
        >
          <Check className="h-4 w-4 mr-1" />
          <span className="text-xs">Approve</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => onStartReject(item.id)}
          disabled={processingMaterialId === item.id}
        >
          <X className="h-4 w-4 mr-1" />
          <span className="text-xs">Reject</span>
        </Button>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-3 max-w-7xl mx-auto">
        <PageHeader
          title="Review Request Details"
          description="Review, approve, or reject individual materials and labour."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            <RequestMetadataCard request={request} pendingCount={pendingCount} />

            {/* Material Breakdown Card */}
            <Card className="flex flex-col shadow-none border border-slate-200/50">
              <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                  Material Breakdown & Review
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {materials.length > 0 && (
                  <MaterialItemsTable
                    items={materials}
                    label="Materials"
                    subtotal={materialTotal}
                    actionRenderer={renderManagerActions}
                  />
                )}
                {labour.length > 0 && (
                  <div className={materials.length > 0 ? 'mt-5' : undefined}>
                    <MaterialItemsTable
                      items={labour}
                      label="Labour"
                      subtotal={labourTotal}
                      actionRenderer={renderManagerActions}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column ─────────────────────────────────────────────── */}
          <div className="space-y-2 sm:space-y-3">
            <RequestTimeline history={history} />

            {/* Related Documents */}
            <Card className="flex flex-col shadow-none border border-slate-200/50">
              <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                  Related Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                <p className="text-sm text-slate-500 text-center py-4">No documents attached</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RequestDetailsManager;
