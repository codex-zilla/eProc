import { useState, useEffect } from 'react';
import { useRequest, useRequestHistory, useUpdateMaterial } from '@/hooks/queries/useRequests';
import type { RequestItem } from '@/types/models';
import { toast } from 'sonner';

export const useEngineerRequestDetails = (requestId: number) => {
  const { data: request, isLoading, error: requestError } = useRequest(requestId);
  const { data: history = [] } = useRequestHistory(requestId);
  const updateMaterialMutation = useUpdateMaterial();

  const [selectedMaterial, setSelectedMaterial] = useState<RequestItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<RequestItem>>({});

  const error = requestError
    ? requestError instanceof Error ? requestError.message : 'Failed to load request details'
    : null;

  useEffect(() => {
    if (selectedMaterial?.status === 'REJECTED') {
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
    if (!selectedMaterial || !request) return;
    try {
      await updateMaterialMutation.mutateAsync({
        requestId: request.id,
        materialId: selectedMaterial.id,
        data: {
          quantity: editValues.quantity,
          measurementUnit: editValues.measurementUnit,
          rateEstimate: editValues.rateEstimate,
          rateType: editValues.rateType
        }
      });
      toast.success('Material updated successfully');
      setSelectedMaterial(null);
    } catch {
      // Error handled by the mutation hook
    }
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
    selectedMaterial,
    setSelectedMaterial,
    editValues,
    setEditValues,
    isSaving: updateMaterialMutation.isPending,
    handleUpdateMaterial
  };
};
