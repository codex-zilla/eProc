import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSites } from '@/hooks/queries/useSites';
import { useCreateBatchRequests } from '@/hooks/queries/useRequests';

export interface MaterialItem {
  tempId: string;
  materialName: string;
  quantity: string;
  measurementUnit: string;
  rateEstimate: string;
  rateEstimateType: string;
}

export interface LabourItem {
  tempId: string;
  labourType: string;
  numberOfLabourers: string;  // how many workers
  numberOfDays: string;       // how many working days
  measurementUnit: string;    // always 'Days' — fixed
  rateEstimate: string;       // day-rate per labourer (TZS)
}

export interface BOQEntry {
  tempId: string;
  siteId: string;
  boqDescription: string;
  workDescription: string;
  plannedStart: string;
  plannedEnd: string;
  emergencyFlag: boolean;
  materials: MaterialItem[];
  labour: LabourItem[];
  duplicateExplanation?: string;
}

export interface DuplicateWarning {
  requestId: number;
  requestTitle: string;
  boqReferenceCode: string;
  plannedStartDate: string;
  plannedEndDate: string;
  overlappingMaterials: string[];
  timelineOverlapPercentage: number;
  status: string;
  siteName: string;
}

const newMaterial = (): MaterialItem => ({
  tempId: crypto.randomUUID(),
  materialName: '',
  quantity: '',
  measurementUnit: '',
  rateEstimate: '',
  rateEstimateType: 'ENGINEER_ESTIMATE',
});

const newLabour = (): LabourItem => ({
  tempId: crypto.randomUUID(),
  labourType: '',
  numberOfLabourers: '',
  numberOfDays: '',
  measurementUnit: 'Days',
  rateEstimate: '',
});

const newBOQEntry = (): BOQEntry => ({
  tempId: crypto.randomUUID(),
  siteId: '',
  boqDescription: '',
  workDescription: '',
  plannedStart: '',
  plannedEnd: '',
  emergencyFlag: false,
  materials: [newMaterial()],
  labour: [newLabour()],
});

const extractErrorMessage = (err: any): string => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  return err.message ?? 'An unexpected error occurred';
};

const isMaterialEmpty = (m: MaterialItem) => 
  !m.materialName && !m.quantity && !m.measurementUnit && !m.rateEstimate;

const isLabourEmpty = (l: LabourItem) => 
  !l.labourType && !l.numberOfLabourers && !l.numberOfDays && !l.rateEstimate;

export const useCreateRequest = () => {
  const navigate = useNavigate();
  const { data: sites = [], isLoading: loadingSites } = useSites();
  const createBatchRequests = useCreateBatchRequests();

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateWarning[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateExplanation, setDuplicateExplanation] = useState('');
  const [pendingSubmission, setPendingSubmission] = useState<any[] | null>(null);
  const [boqEntries, setBoqEntries] = useState<BOQEntry[]>([newBOQEntry()]);

  // Auto-select site if only one available
  useEffect(() => {
    if (sites.length === 1 && boqEntries[0].siteId === '') {
      setBoqEntries(prev =>
        prev.map((entry, idx) =>
          idx === 0 ? { ...entry, siteId: sites[0].id.toString() } : entry
        )
      );
    }
  }, [sites]);

  // ── BOQ Entry Actions ──────────────────────────────────────────────────────
  const addBOQEntry = () => setBoqEntries(prev => [...prev, newBOQEntry()]);

  const removeBOQEntry = (tempId: string) => {
    setBoqEntries(prev => (prev.length > 1 ? prev.filter(e => e.tempId !== tempId) : prev));
  };

  const updateBOQEntry = (tempId: string, field: keyof BOQEntry, value: any) => {
    setBoqEntries(prev =>
      prev.map(e => (e.tempId === tempId ? { ...e, [field]: value } : e))
    );
  };

  // ── Material Actions ───────────────────────────────────────────────────────
  const addMaterial = (boqTempId: string) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? { ...e, materials: [...e.materials, newMaterial()] }
          : e
      )
    );
  };

  const removeMaterial = (boqTempId: string, materialTempId: string) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? { ...e, materials: e.materials.filter(m => m.tempId !== materialTempId) }
          : e
      )
    );
  };

  const updateMaterial = (
    boqTempId: string,
    materialTempId: string,
    field: keyof MaterialItem,
    value: string
  ) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? {
              ...e,
              materials: e.materials.map(m =>
                m.tempId === materialTempId ? { ...m, [field]: value } : m
              ),
            }
          : e
      )
    );
  };

  // ── Labour Actions ─────────────────────────────────────────────────────────
  const addLabour = (boqTempId: string) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? { ...e, labour: [...e.labour, newLabour()] }
          : e
      )
    );
  };

  const removeLabour = (boqTempId: string, labourTempId: string) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? { ...e, labour: e.labour.filter(l => l.tempId !== labourTempId) }
          : e
      )
    );
  };

  const updateLabour = (
    boqTempId: string,
    labourTempId: string,
    field: keyof LabourItem,
    value: string
  ) => {
    setBoqEntries(prev =>
      prev.map(e =>
        e.tempId === boqTempId
          ? {
              ...e,
              labour: e.labour.map(l =>
                l.tempId === labourTempId ? { ...l, [field]: value } : l
              ),
            }
          : e
      )
    );
  };

  // ── Cost Calculations ──────────────────────────────────────────────────────
  const calculateMaterialCost = (entry: BOQEntry) =>
    entry.materials.reduce(
      (sum, m) => sum + (parseFloat(m.quantity) || 0) * (parseFloat(m.rateEstimate) || 0),
      0
    );

  const calculateLabourCost = (entry: BOQEntry) =>
    entry.labour.reduce(
      (sum, l) =>
        sum +
        (parseFloat(l.numberOfLabourers) || 0) *
          (parseFloat(l.numberOfDays) || 0) *
          (parseFloat(l.rateEstimate) || 0),
      0
    );

  const calculateBOQTotal = (entry: BOQEntry) =>
    calculateMaterialCost(entry) + calculateLabourCost(entry);

  const calculateGrandTotal = () =>
    boqEntries.reduce((sum, e) => sum + calculateBOQTotal(e), 0);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (entriesToValidate: BOQEntry[]): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    entriesToValidate.forEach(entry => {
      if (!entry.siteId) {
        errors[`site-${entry.tempId}`] = 'Please select a site';
        isValid = false;
      }
      if (!entry.boqDescription.trim()) {
        errors[`boqDesc-${entry.tempId}`] = 'Please enter a BOQ description';
        isValid = false;
      }
      if (entry.materials.length === 0 && entry.labour.length === 0) {
        errors[`items-${entry.tempId}`] = 'Please add at least one material or labour item';
        isValid = false;
      }

      const seenNames = new Set<string>();

      entry.materials.forEach(m => {
        if (!m.materialName || !m.quantity || !m.measurementUnit || !m.rateEstimate) {
          errors[m.tempId] = 'All material fields are required';
          isValid = false;
        } else if (m.materialName) {
          const nameLower = m.materialName.trim().toLowerCase();
          if (seenNames.has(nameLower)) {
            errors[m.tempId] = 'Duplicate item name in the current request';
            isValid = false;
          } else {
            seenNames.add(nameLower);
          }
        }
      });

      entry.labour.forEach(l => {
        if (!l.labourType || !l.numberOfLabourers || !l.numberOfDays || !l.rateEstimate) {
          errors[l.tempId] = 'Labour type, workers, days, and day rate are all required';
          isValid = false;
        } else if (l.labourType) {
          const nameLower = l.labourType.trim().toLowerCase();
          if (seenNames.has(nameLower)) {
            errors[l.tempId] = 'Duplicate item name in the current request';
            isValid = false;
          } else {
            seenNames.add(nameLower);
          }
        }
      });
    });

    setValidationErrors(errors);
    return isValid;
  };

  // ── Payload Builder ────────────────────────────────────────────────────────
  const buildPayload = (entries: BOQEntry[], extraFields?: Record<string, any>) =>
    entries.map(entry => ({
      projectId: sites.find(s => s.id === parseInt(entry.siteId))?.projectId ?? 0,
      siteId: parseInt(entry.siteId),
      title: entry.boqDescription,
      plannedStartDate: entry.plannedStart
        ? `${entry.plannedStart}T00:00:00`
        : new Date().toISOString(),
      plannedEndDate: entry.plannedEnd
        ? `${entry.plannedEnd}T23:59:59`
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      emergencyFlag: entry.emergencyFlag,
      additionalDetails: entry.workDescription || '',
      duplicateExplanation: entry.duplicateExplanation,
      ...extraFields,
      items: [
        ...entry.materials.map(mat => ({
          name: mat.materialName,
          quantity: parseFloat(mat.quantity),
          measurementUnit: mat.measurementUnit,
          rateEstimate: parseFloat(mat.rateEstimate),
          rateEstimateType: mat.rateEstimateType,
          resourceType: 'MATERIAL',
        })),
        ...entry.labour.map(lab => ({
          name: lab.labourType,
          quantity: (parseFloat(lab.numberOfLabourers) || 0) * (parseFloat(lab.numberOfDays) || 0),
          measurementUnit: 'Days',
          rateEstimate: parseFloat(lab.rateEstimate),
          rateEstimateType: 'ENGINEER_ESTIMATE',
          resourceType: 'LABOUR',
          numberOfLabourers: parseInt(lab.numberOfLabourers) || undefined,
          numberOfDays: parseFloat(lab.numberOfDays) || undefined,
        })),
      ],
    }));

  // ── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Filter out completely empty rows for validation and payload
    const cleanedEntries = boqEntries.map(entry => ({
      ...entry,
      materials: entry.materials.filter(m => !isMaterialEmpty(m)),
      labour: entry.labour.filter(l => !isLabourEmpty(l)),
    }));

    if (!validate(cleanedEntries)) {
      setError('Please fix the highlighted errors below before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = buildPayload(cleanedEntries);

    try {
      await createBatchRequests.mutateAsync(payload);
      navigate('/engineer/requests');
    } catch (err: any) {
      console.error('Failed to submit batch:', err);

      if (err.response?.status === 409 && err.response?.data?.duplicates) {
        setPendingSubmission(payload);
        setDuplicateWarnings(err.response.data.duplicates);
        setShowDuplicateModal(true);
        return;
      }

      setError(extractErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDuplicateConfirm = async (explanation: string) => {
    if (!pendingSubmission) return;

    setShowDuplicateModal(false);
    setError(null);

    try {
      const withExplanation = pendingSubmission.map((req: any) => ({
        ...req,
        duplicateExplanation: explanation,
      }));
      await createBatchRequests.mutateAsync(withExplanation);
      navigate('/engineer/requests');
    } catch (err: any) {
      console.error('Failed to submit batch after duplicate confirmation:', err);
      setError(extractErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setPendingSubmission(null);
      setDuplicateWarnings([]);
      setDuplicateExplanation('');
    }
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setPendingSubmission(null);
    setDuplicateWarnings([]);
    setDuplicateExplanation('');
  };

  return {
    state: {
      sites,
      loadingSites,
      error,
      validationErrors,
      boqEntries,
      duplicateWarnings,
      showDuplicateModal,
      duplicateExplanation,
      isSubmitting: createBatchRequests.isPending,
    },
    actions: {
      addBOQEntry,
      removeBOQEntry,
      updateBOQEntry,
      addMaterial,
      removeMaterial,
      updateMaterial,
      addLabour,
      removeLabour,
      updateLabour,
      calculateMaterialCost,
      calculateLabourCost,
      calculateBOQTotal,
      calculateGrandTotal,
      handleSubmit,
      handleDuplicateConfirm,
      handleDuplicateCancel,
      setDuplicateExplanation,
      navigate,
    },
  };
};
