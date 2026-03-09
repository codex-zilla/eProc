import { useState } from 'react';
import { useRequest, useRequestHistory, useUpdateMaterial } from '@/hooks/queries/useRequests';
import type { RequestItem } from '@/types/models';
import { toast } from 'sonner';

export const useManagerRequestDetails = (requestId: number) => {
  const { data: request, isLoading, error: requestError } = useRequest(requestId);
  const { data: history = [] } = useRequestHistory(requestId);
  const updateStatusMutation = useUpdateMaterial();

  const [rejectComment, setRejectComment] = useState('');
  const [rejectingMaterialId, setRejectingMaterialId] = useState<number | null>(null);
  const [processingMaterialId, setProcessingMaterialId] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<RequestItem | null>(null);

  const error = requestError
    ? requestError instanceof Error ? requestError.message : 'Failed to load request details'
    : null;

  const handleMaterialAction = async (materialId: number, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    if (!request) return;
    setProcessingMaterialId(materialId);
    try {
      await updateStatusMutation.mutateAsync({
        requestId: request.id,
        materialId,
        data: {
          status,
          comment,
        }
      });
      toast.success(`Material ${status.toLowerCase()} successfully`);
      setRejectingMaterialId(null);
      setRejectComment('');
      
      if (selectedMaterial && selectedMaterial.id === materialId) {
        setSelectedMaterial({ ...selectedMaterial, status });
      }
    } catch {
      toast.error(`Failed to ${status.toLowerCase()} material`);
    } finally {
      setProcessingMaterialId(null);
    }
  };

  const onCancelReject = () => {
    setRejectingMaterialId(null);
    setRejectComment('');
  };

  const onConfirmReject = (materialId: number) => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    handleMaterialAction(materialId, 'REJECTED', rejectComment);
  };

  const onStartReject = (materialId: number) => {
    setRejectingMaterialId(materialId);
    setRejectComment('');
  };

  const onApprove = (materialId: number) => {
    handleMaterialAction(materialId, 'APPROVED');
  };

  const calculateTotal = (items: RequestItem[], type: 'MATERIAL' | 'LABOUR') =>
    items.filter(i => i.resourceType === type).reduce((sum, i) => sum + i.quantity * i.rateEstimate, 0);

  const materials = request?.materials?.filter(i => i.resourceType === 'MATERIAL') || [];
  const labour = request?.materials?.filter(i => i.resourceType === 'LABOUR') || [];
  const materialTotal = calculateTotal(request?.materials || [], 'MATERIAL');
  const labourTotal = calculateTotal(request?.materials || [], 'LABOUR');
  const pendingCount = request?.materials?.filter(m => m.status === 'PENDING').length || 0;

  return {
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
    selectedMaterial,
    setSelectedMaterial,
    handlers: {
      onApprove,
      onStartReject,
      onConfirmReject,
      onCancelReject,
    }
  };
};
