/**
 * useProjectWizard Hook
 * 
 * Encapsulates ALL logic for the Project Wizard:
 * - Form state, field errors, loading/error states
 * - Step navigation with validation
 * - Geocoding / map state
 * - Site CRUD
 * - Submission (create + update)
 * - Exchange rate fetching
 * - Edit mode initialization
 * 
 * Follows the pattern established by useTeamManagement.ts
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllRegions, getDistrictData, getWardData } from 'tz-geo-data';

import type { Project, ProjectWizardFormData, Site } from '@/types/models';
import { getCoordinates } from '@/lib/geocoding';
import { getExchangeRate } from '@/lib/currency';
import { projectService } from '@/services/projectService';
import { validateWizardStep } from '@/lib/project-wizard-validators';
import { buildProjectPayload } from '@/lib/project-wizard-payload';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDraft } from '@/hooks/useDraft';
import { useDebounce } from '@/hooks/useDebounce';

interface UseProjectWizardOptions {
    initialData?: Project;
    initialSites?: Site[];
    isEditMode: boolean;
}

const DEFAULT_FORM_DATA: ProjectWizardFormData = {
    // Step 1
    name: '',
    code: '',
    industry: '',
    projectType: '',
    currency: 'TZS',
    budgetDisplay: '',
    description: '',
    // Step 2
    region: '',
    district: '',
    ward: '',
    plotNumber: '',
    gpsCoordinates: '',
    siteAccessNotes: '',
    titleDeedAvailable: false,
    // Step 3
    ownerRepName: '',
    ownerRepContact: '',
    startDate: '',
    expectedCompletionDate: '',
    contractType: '',
    defectsLiabilityPeriod: '',
    performanceSecurityRequired: false,
    // Step 4
    keyObjectives: '',
    expectedOutput: '',
    // Sites
    initialSites: [{ name: 'Main Site', budgetCap: '', location: '', gpsCenter: '' }]
};

export function useProjectWizard({ initialData, initialSites, isEditMode }: UseProjectWizardOptions) {
    const navigate = useNavigate();
    const { handleError } = useErrorHandler();

    // ─── Core State ───
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const DRAFT_KEY = isEditMode && initialData ? `project-wizard-draft-edit-${initialData.id}` : 'project-wizard-draft-new';

    const generateProjectCode = () => `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // ─── Form State ───
    const [formData, setFormData] = useState<ProjectWizardFormData>({
        ...DEFAULT_FORM_DATA,
        code: initialData?.code || generateProjectCode(),
        keyObjectives: initialData?.keyObjectives || '',
        expectedOutput: initialData?.expectedOutput || '',
        initialSites: isEditMode && initialData
            ? []
            : [{ name: 'Main Site', budgetCap: '', location: '', gpsCenter: '' }]
    });

    // ─── Map / Geo State ───
    const [exchangeRate, setExchangeRate] = useState<number>(2500);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -6.7924, lng: 39.2083 });
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

    // ─── Exchange Rate ───
    useEffect(() => {
        getExchangeRate().then(setExchangeRate);
    }, []);

    // ─── Edit Mode Initialization ───
    useEffect(() => {
        const draftExists = localStorage.getItem(DRAFT_KEY);
        if (initialData && isEditMode && !draftExists) {
            setFormData(prev => ({
                ...prev,
                name: initialData.name,
                currency: initialData.currency,
                description: initialData.description || '',
                budgetDisplay: initialData.budgetTotal?.toString() || '',
                code: initialData.code || '',
                industry: initialData.industry || '',
                projectType: initialData.projectType || '',
                ownerRepName: initialData.ownerRepName || '',
                ownerRepContact: initialData.ownerRepContact || '',
                region: initialData.region || '',
                district: initialData.district || '',
                ward: initialData.ward || '',
                plotNumber: initialData.plotNumber || '',
                gpsCoordinates: initialData.gpsCoordinates || '',
                titleDeedAvailable: initialData.titleDeedAvailable || false,
                siteAccessNotes: initialData.siteAccessNotes || '',
                startDate: initialData.startDate || '',
                expectedCompletionDate: initialData.expectedCompletionDate || '',
                contractType: initialData.contractType || '',
                defectsLiabilityPeriod: initialData.defectsLiabilityPeriod ?? '',
                performanceSecurityRequired: initialData.performanceSecurityRequired || false,
                keyObjectives: initialData.keyObjectives || '',
                expectedOutput: initialData.expectedOutput || '',
                initialSites: initialSites && initialSites.length > 0 
                    ? initialSites.map(s => ({
                        id: s.id,
                        name: s.name,
                        budgetCap: s.budgetCap?.toString() || '',
                        location: s.location || '',
                        gpsCenter: s.gpsCenter || ''
                    }))
                    : [{ name: 'Main Site', budgetCap: '', location: '', gpsCenter: '' }]
            }));

            if (initialData.gpsCoordinates) {
                const [lat, lng] = initialData.gpsCoordinates.split(',').map(s => parseFloat(s.trim()));
                if (!isNaN(lat) && !isNaN(lng)) setMarkerPosition({ lat, lng });
            }
        }
    }, [initialData, initialSites, isEditMode, DRAFT_KEY]);

    // ─── Draft Integration ───
    const { saveData, clearData } = useDraft<any>({
        key: DRAFT_KEY,
        shouldLoad: true,
        onLoad: (draft) => {
            if (draft.step) setStep(draft.step);
            if (draft.formData) setFormData(draft.formData);
            if (draft.markerPosition) {
                setMarkerPosition(draft.markerPosition);
                setMapCenter(draft.markerPosition);
            }
        }
    });

    const draftState = useDebounce({ step, formData, markerPosition }, 1000);

    useEffect(() => {
        saveData(draftState);
    }, [draftState]);

    // ─── Handlers ───

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // ─── Geocoding ───

    const updateMapLocation = async (query: string) => {
        const coords = await getCoordinates(query);
        if (coords) {
            setMapCenter(coords);
            setMarkerPosition(coords);
            handleChange('gpsCoordinates', `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`);
        }
    };

    useEffect(() => {
        if (formData.ward) {
            const loc = `${formData.ward}, ${formData.district}, ${formData.region}, Tanzania`;
            updateMapLocation(loc);
            setFormData(prev => {
                const newSites = [...prev.initialSites];
                if (newSites.length > 0) {
                    newSites[0] = { ...newSites[0], location: loc };
                }
                return { ...prev, initialSites: newSites };
            });
        } else if (formData.district) {
            updateMapLocation(`${formData.district}, ${formData.region}, Tanzania`);
        } else if (formData.region) {
            updateMapLocation(`${formData.region}, Tanzania`);
        }
    }, [formData.region, formData.district, formData.ward]);

    const handleLocationSelect = (lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
        const gps = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        handleChange('gpsCoordinates', gps);
        setFormData(prev => {
            const newSites = [...prev.initialSites];
            if (newSites.length > 0) {
                newSites[0] = { ...newSites[0], gpsCenter: gps };
            }
            return { ...prev, initialSites: newSites };
        });
    };

    // ─── Site CRUD ───

    const addSite = () => {
        setFormData(prev => ({
            ...prev,
            initialSites: [...prev.initialSites, { name: '', budgetCap: '', location: '', gpsCenter: '' }]
        }));
    };

    const removeSite = (index: number) => {
        if (formData.initialSites.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            initialSites: prev.initialSites.filter((_, i) => i !== index)
        }));
    };

    const updateSite = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newSites = [...prev.initialSites];
            newSites[index] = { ...newSites[index], [field]: value };
            return { ...prev, initialSites: newSites };
        });
    };

    // ─── Validation ───

    const runValidation = (targetStep: number): boolean => {
        const errors = validateWizardStep(targetStep, formData);
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ─── Navigation ───

    const nextStep = () => {
        if (runValidation(step)) {
            setStep(prev => prev + 1);
            setError(null);
        } else {
            setError('Please fill in all required fields before proceeding');
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        setError(null);
        setFieldErrors({});
    };

    // ─── Submission ───

    const handleSubmit = async () => {
        if (!runValidation(1) || !runValidation(2) || !runValidation(3)) {
            setError('Please complete all required fields correctly');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = buildProjectPayload(formData, markerPosition, exchangeRate);

            if (isEditMode && initialData) {
                await projectService.updateProject(initialData.id, payload);
                toast.success('Project updated successfully');
            } else {
                await projectService.createProject(payload);
                toast.success('Project created successfully');
            }

            clearData();
            navigate('/manager/projects');
        } catch (err: any) {
            handleError(err, isEditMode ? 'Failed to update project' : 'Failed to create project');
            // Also set local error for inline display
            const msg = err.response?.data?.message || 'Action failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ─── Derived Data ───

    const regions = useMemo(() => getAllRegions(), []);
    const districts = useMemo(
        () => formData.region ? getDistrictData(formData.region) : [],
        [formData.region]
    );
    const wards = useMemo(
        () => (formData.region && formData.district) ? getWardData(formData.region, formData.district) : [],
        [formData.region, formData.district]
    );

    return {
        // Form
        formData,
        handleChange,
        fieldErrors,
        // Navigation
        step,
        nextStep,
        prevStep,
        // Submission
        handleSubmit,
        loading,
        error,
        // Location
        mapCenter,
        markerPosition,
        handleLocationSelect,
        // Sites
        addSite,
        removeSite,
        updateSite,
        // Derived
        regions,
        districts,
        wards,
        exchangeRate,
        isEditMode
    };
}
