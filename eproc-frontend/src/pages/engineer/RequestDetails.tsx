import { Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { AlertCircle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

import { useEngineerRequestDetails } from '@/hooks/useEngineerRequestDetails';
import { RequestMetadataCard } from '@/components/domain/requests/details/RequestMetadataCard';
import { RequestTimeline } from '@/components/domain/requests/details/RequestTimeline';
import { MaterialItemsTable } from '@/components/domain/requests/details/MaterialItemsTable';
import { ItemDetailModal } from '@/components/domain/requests/details/ItemDetailModal';

const RequestDetails = () => {
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
    selectedMaterial,
    setSelectedMaterial,
    editValues,
    setEditValues,
    isSaving,
    handleUpdateMaterial,
  } = useEngineerRequestDetails(requestId);

  // ── Loading / Error / Empty guards ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Loading request..." />
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
            to="/engineer/requests"
            className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs sm:text-sm font-medium"
          >
            Go back to My Requests
          </Link>
        }
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-7xl mx-auto">
        <PageHeader
          title="Request Details"
          description="View complete request batch with material and labour breakdown."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-3">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            <RequestMetadataCard request={request} pendingCount={pendingCount} />

            {/* Material Breakdown Card */}
            <Card className="flex flex-col shadow-none border border-slate-200/50">
              <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                  Material Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {materials.length > 0 && (
                  <MaterialItemsTable
                    items={materials}
                    label="Cost of Materials"
                    subtotal={materialTotal}
                    onRowClick={setSelectedMaterial}
                  />
                )}
                {labour.length > 0 && (
                  <div className={materials.length > 0 ? 'mt-5' : undefined}>
                    <MaterialItemsTable
                      items={labour}
                      label="Cost of Labour"
                      subtotal={labourTotal}
                      onRowClick={setSelectedMaterial}
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
              isSaving={isSaving}
              onClose={() => setSelectedMaterial(null)}
              onSave={handleUpdateMaterial}
              onEditChange={setEditValues}
            />
          )}

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

export default RequestDetails;
