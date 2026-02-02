import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2 } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { getExchangeRate, convertToTZS } from '@/lib/currency';
import { getAllRegions, getDistrictData, getWardData } from 'tz-geo-data';

import { getCoordinates } from '@/lib/geocoding';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/models';
import { Industry, ProjectType, ContractType } from '@/types/models';

interface ProjectWizardProps {
    initialData?: Project;
    isEditMode?: boolean;
}

const ProjectWizard = ({ initialData, isEditMode = false }: ProjectWizardProps) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Initial State
    const [formData, setFormData] = useState({
        // Step 1: Core Identity
        name: '',
        code: '',
        industry: '',
        projectType: '',
        currency: 'TZS',
        budgetDisplay: '',
        description: '',
        
        // Step 2: Location
        region: '',
        district: '',
        ward: '',
        plotNumber: '',
        gpsCoordinates: '',
        siteAccessNotes: '',
        titleDeedAvailable: false,
        
        // Step 3: Owner & Timeline
        ownerRepName: '',
        ownerRepContact: '',
        startDate: '',
        expectedCompletionDate: '',
        
        // Step 4: Contract
        contractType: '',
        defectsLiabilityPeriod: 0,
        performanceSecurityRequired: false,
        
        // Step 4: Context
        keyObjectives: initialData?.keyObjectives || '',
        expectedOutput: initialData?.expectedOutput || '',

        // Multi-site
        initialSites: isEditMode && initialData ? [] : [{ name: 'Main Site', budgetCap: '', location: '', gpsCenter: '' }]
    });

    // Populate existing sites if available (fetched separately or included in Project model)
    // For now, we assume initialSites might be needed if we fetch them. 
    // If the backend returns sites with the project, we would map them here.
    // However, existing sites are stored in `sites` table. 
    // If we want to manage sites in Edit, we need to fetch them.
    
    // For this implementation, we will assume generic Edit Mode prepopulates basic fields.
    // Enhanced Site Management in Edit Mode requires fetching existing sites.
    
    useEffect(() => {
        if (initialData && isEditMode) {
             setFormData(prev => ({
                ...prev,
                name: initialData.name,
                currency: initialData.currency,
                description: initialData.description || '',
                budgetTotal: initialData.budgetTotal?.toString() || '',
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
                defectsLiabilityPeriod: initialData.defectsLiabilityPeriod || 0,
                performanceSecurityRequired: initialData.performanceSecurityRequired || false,
                
                keyObjectives: initialData.keyObjectives || '',
                expectedOutput: initialData.expectedOutput || ''
            }));
            
            if (initialData.gpsCoordinates) {
                 const [lat, lng] = initialData.gpsCoordinates.split(',').map(s => parseFloat(s.trim()));
                 if (!isNaN(lat) && !isNaN(lng)) setMarkerPosition({ lat, lng });
            }
        }
    }, [initialData, isEditMode]);

    const [exchangeRate, setExchangeRate] = useState<number>(2500);
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -6.7924, lng: 39.2083 });
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        getExchangeRate().then(setExchangeRate);
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Geo Updates
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
            // Update default site location text
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
        
        // Update default site GPS
        setFormData(prev => {
            const newSites = [...prev.initialSites];
             if (newSites.length > 0) {
                 newSites[0] = { ...newSites[0], gpsCenter: gps };
            }
            return { ...prev, initialSites: newSites };
        });
    };

    const addSite = () => {
        setFormData(prev => ({
            ...prev,
            initialSites: [...prev.initialSites, { name: '', budgetCap: '', location: '', gpsCenter: '' }]
        }));
    };

    const removeSite = (index: number) => {
        if (formData.initialSites.length <= 1) return; // Prevent deleting last site
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

    // Validation function
    const validateStep = (currentStep: number): boolean => {
        const errors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) {
                errors.name = 'Project name is required';
            }
            if (!formData.industry) {
                errors.industry = 'Industry selection is required';
            }
            if (!formData.projectType) {
                errors.projectType = 'Project type is required';
            }
        }

        if (currentStep === 2) {
            if (!formData.region) {
                errors.region = 'Region is required';
            }
            if (!formData.district) {
                errors.district = 'District is required';
            }
            if (!formData.ward) {
                errors.ward = 'Ward is required';
            }
        }

        if (currentStep === 3) {
            if (!formData.startDate) {
                errors.startDate = 'Start date is required';
            }
            if (!formData.expectedCompletionDate) {
                errors.expectedCompletionDate = 'Expected completion date is required';
            }
            if (formData.startDate && formData.expectedCompletionDate) {
                if (new Date(formData.startDate) >= new Date(formData.expectedCompletionDate)) {
                    errors.expectedCompletionDate = 'Completion date must be after start date';
                }
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        // Validate all steps before submission
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
            setError('Please complete all required fields correctly');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const budgetVal = parseFloat(formData.budgetDisplay);
            const budgetInTZS = convertToTZS(isNaN(budgetVal) ? 0 : budgetVal, formData.currency, exchangeRate);

            const payload = {
                name: formData.name,
                code: formData.code,
                industry: formData.industry,
                projectType: formData.projectType,
                currency: 'TZS',
                budgetTotal: budgetInTZS,
                
                region: formData.region,
                district: formData.district,
                ward: formData.ward,
                plotNumber: formData.plotNumber,
                gpsCoordinates: markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : formData.gpsCoordinates,
                siteAccessNotes: formData.siteAccessNotes,
                titleDeedAvailable: formData.titleDeedAvailable,
                siteLocation: markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : '', // Legacy compat

                ownerRepName: formData.ownerRepName,
                ownerRepContact: formData.ownerRepContact,
                startDate: formData.startDate,
                expectedCompletionDate: formData.expectedCompletionDate,

                contractType: formData.contractType,
                defectsLiabilityPeriod: formData.defectsLiabilityPeriod,
                performanceSecurityRequired: formData.performanceSecurityRequired,
                description: formData.description,

                keyObjectives: formData.keyObjectives,
                expectedOutput: formData.expectedOutput,

                initialSites: formData.initialSites
                    .filter(s => s.name)
                    .map(s => ({
                        id: (s as any).id,
                        name: s.name,
                        budgetCap: s.budgetCap ? parseFloat(s.budgetCap) : 0,
                        location: s.location || `${formData.ward}, ${formData.district}`,
                        gpsCenter: s.gpsCenter
                    }))
            };

            if (isEditMode && initialData) {
                await projectService.updateProject(initialData.id, payload);
            } else {
                await projectService.createProject(payload);
            }
            
            navigate('/manager/projects');
        } catch (err: any) {
            console.error(err);
            
            // Enhanced error handling
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                setError('Connection failed. Please check your internet connection and try again.');
            } else if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to perform this action.');
            } else if (err.response?.status === 400) {
                setError(err.response?.data?.message || 'Invalid data. Please check all fields.');
            } else if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setError(err.response?.data?.message || 'Action failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
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

    // Derived Lists
    const regions = useMemo(() => getAllRegions(), []);
    const districts = useMemo(() => formData.region ? getDistrictData(formData.region) : [], [formData.region]);
    const wards = useMemo(() => (formData.region && formData.district) ? getWardData(formData.region, formData.district) : [], [formData.region, formData.district]);

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            
            {/* Steps Indicator */}
            <div className="relative flex justify-between mb-6 sm:mb-8 px-2 sm:px-6 lg:px-10">
                {/* Progress Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2 mx-6 sm:mx-10 lg:mx-14"></div>
                
                {/* Progress Line Foreground */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-[#2a3455] -translate-y-1/2 mx-6 sm:mx-10 lg:mx-14 transition-all duration-500 ease-in-out"
                    style={{ width: `calc(${((step - 1) / 4) * 100}% - ${step === 1 ? '0px' : '24px'})` }}
                ></div>

                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="relative z-10">
                        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 ${step >= s ? 'bg-[#2a3455] border-[#2a3455] text-white shadow-md' : 'border-gray-300 text-gray-400 bg-white'}`}>
                            {step > s ? <Check className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : s}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm">
                    <span className="font-medium">Error:</span> {error}
                </div>
            )}

            <Card className="shadow-sm">
                {/* Step 1: Core Identity */}
                {step === 1 && (
                    <>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl">General Information</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Basic details to identify the project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">
                                    Project Name <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={e => handleChange('name', e.target.value)} 
                                    placeholder="e.g. Skyline Apartments"
                                    className={`h-9 sm:h-10 text-sm ${fieldErrors.name ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Project Code</Label>
                                <Input 
                                    value={formData.code} 
                                    onChange={e => handleChange('code', e.target.value)} 
                                    placeholder="e.g. PRJ-2026-001"
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Industry <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.industry} onValueChange={v => handleChange('industry', v)}>
                                        <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.industry ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select Industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Industry).map(i => <SelectItem key={i} value={i} className="text-xs sm:text-sm">{i}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.industry && <p className="text-xs text-red-500">{fieldErrors.industry}</p>}
                                </div>
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Project Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.projectType} onValueChange={v => handleChange('projectType', v)}>
                                        <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.projectType ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ProjectType).map(t => <SelectItem key={t} value={t} className="text-xs sm:text-sm">{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.projectType && <p className="text-xs text-red-500">{fieldErrors.projectType}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">Currency</Label>
                                    <Select value={formData.currency} onValueChange={v => handleChange('currency', v)}>
                                        <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TZS" className="text-xs sm:text-sm">TZS - Tanzanian Shilling</SelectItem>
                                            <SelectItem value="USD" className="text-xs sm:text-sm">USD - US Dollar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">Rate: 1 USD ≈ {exchangeRate.toLocaleString()} TZS</p>
                                </div>
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">Budget Estimate</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.budgetDisplay} 
                                        onChange={e => handleChange('budgetDisplay', e.target.value)} 
                                        placeholder="0.00"
                                        className="h-9 sm:h-10 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Description</Label>
                                <Textarea 
                                    value={formData.description} 
                                    onChange={e => handleChange('description', e.target.value)} 
                                    placeholder="Detailed project description..."
                                    className="resize-none h-20 sm:h-24 text-sm"
                                />
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Location Details</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Where is the project located?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Region <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.region} onValueChange={v => handleChange('region', v)}>
                                        <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.region ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select Region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map(r => <SelectItem key={r.region} value={r.region} className="text-xs sm:text-sm">{r.region}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.region && <p className="text-xs text-red-500">{fieldErrors.region}</p>}
                                </div>
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        District <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.district} onValueChange={v => handleChange('district', v)} disabled={!formData.region || districts.length === 0}>
                                        <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.district ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder={!formData.region ? "Select Region First" : districts.length === 0 ? "No districts found" : "Select District"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.length === 0 ? (
                                                <SelectItem value="no-districts" disabled className="text-xs sm:text-sm text-muted-foreground">No districts found</SelectItem>
                                            ) : (
                                                districts.map(d => <SelectItem key={d.name} value={d.name} className="text-xs sm:text-sm">{d.name}</SelectItem>)
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.district && <p className="text-xs text-red-500">{fieldErrors.district}</p>}
                                </div>
                                <div className="grid gap-1.5 sm:gap-2 sm:col-span-2 lg:col-span-1">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Ward <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.ward} onValueChange={v => handleChange('ward', v)} disabled={!formData.district || wards.length === 0}>
                                        <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm ${fieldErrors.ward ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder={!formData.district ? "Select District First" : wards.length === 0 ? "No wards found" : "Select Ward"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.length === 0 ? (
                                                <SelectItem value="no-wards" disabled className="text-xs sm:text-sm text-muted-foreground">No wards found</SelectItem>
                                            ) : (
                                                wards.map(w => <SelectItem key={w.name} value={w.name} className="text-xs sm:text-sm">{w.name}</SelectItem>)
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.ward && <p className="text-xs text-red-500">{fieldErrors.ward}</p>}
                                </div>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Plot Number</Label>
                                <Input 
                                    value={formData.plotNumber} 
                                    onChange={e => handleChange('plotNumber', e.target.value)}
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="titleDeed" 
                                    checked={formData.titleDeedAvailable} 
                                    onCheckedChange={(v: boolean | 'indeterminate') => handleChange('titleDeedAvailable', v === true)} 
                                />
                                <Label htmlFor="titleDeed" className="text-xs sm:text-sm font-normal cursor-pointer">Title Deed Available?</Label>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">
                                    Pin on Map
                                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 font-normal">(Click to refine location)</span>
                                </Label>
                                <LocationPicker center={mapCenter} markerPosition={markerPosition} onLocationSelect={handleLocationSelect} />
                                {markerPosition && (
                                    <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
                                        ✓ Selected: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Site Access Notes</Label>
                                <Textarea 
                                    value={formData.siteAccessNotes} 
                                    onChange={e => handleChange('siteAccessNotes', e.target.value)} 
                                    placeholder="e.g. 4x4 required, muddy road..."
                                    className="resize-none h-20 sm:h-24 text-sm"
                                />
                            </div>
                        </CardContent>

                        <div className="px-4 sm:px-6 pb-6">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Work Sites</h3>
                                    <p className="text-xs text-muted-foreground">Define sites for this project (at least one).</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addSite} className="text-xs h-8">
                                    <Plus className="w-3 h-3 mr-1" /> Add Site
                                </Button>
                             </div>

                             <div className="space-y-3">
                                {formData.initialSites.map((site, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-white rounded-lg border shadow-sm">
                                        <div className="sm:col-span-3 grid gap-1.5">
                                            <Label className="text-xs">Site Name <span className="text-red-500">*</span></Label>
                                            <Input 
                                                value={site.name} 
                                                onChange={e => updateSite(index, 'name', e.target.value)}
                                                placeholder="e.g. Main Site"
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                         <div className="sm:col-span-3 grid gap-1.5">
                                            <Label className="text-xs">Budget Cap (Optional)</Label>
                                            <Input 
                                                type="number"
                                                value={site.budgetCap} 
                                                onChange={e => updateSite(index, 'budgetCap', e.target.value)}
                                                placeholder="0.00"
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                         <div className="sm:col-span-5 grid gap-1.5">
                                             <Label className="text-xs">Location</Label>
                                             <Input 
                                                value={site.location} 
                                                 onChange={e => updateSite(index, 'location', e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                         </div>
                                        <div className="sm:col-span-1 flex items-end justify-center pb-0.5">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeSite(index)}
                                                disabled={formData.initialSites.length === 1}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </>
                )}

                {/* Step 3: Owner & Timeline */}
                {step === 3 && (
                    <>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Owner, Timeline & Contract</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Project ownership and scheduling details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Owner Representative Name</Label>
                                <Input 
                                    value={formData.ownerRepName} 
                                    onChange={e => handleChange('ownerRepName', e.target.value)}
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Owner Rep Contact</Label>
                                <Input 
                                    value={formData.ownerRepContact} 
                                    onChange={e => handleChange('ownerRepContact', e.target.value)}
                                    placeholder="Phone or email"
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        type="date" 
                                        value={formData.startDate} 
                                        onChange={e => handleChange('startDate', e.target.value)}
                                        className={`h-9 sm:h-10 text-sm ${fieldErrors.startDate ? 'border-red-500' : ''}`}
                                    />
                                    {fieldErrors.startDate && <p className="text-xs text-red-500">{fieldErrors.startDate}</p>}
                                </div>
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">
                                        Expected Completion <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        type="date" 
                                        value={formData.expectedCompletionDate} 
                                        onChange={e => handleChange('expectedCompletionDate', e.target.value)}
                                        className={`h-9 sm:h-10 text-sm ${fieldErrors.expectedCompletionDate ? 'border-red-500' : ''}`}
                                    />
                                    {fieldErrors.expectedCompletionDate && <p className="text-xs text-red-500">{fieldErrors.expectedCompletionDate}</p>}
                                </div>
                            </div>

                            <hr className="my-3 sm:my-4" />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">Contract Type</Label>
                                    <Select value={formData.contractType} onValueChange={v => handleChange('contractType', v)}>
                                        <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                                            <SelectValue placeholder="Select Contract Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ContractType).map(t => <SelectItem key={t} value={t} className="text-xs sm:text-sm">{t.replace(/_/g, ' ')}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5 sm:gap-2">
                                    <Label className="text-xs sm:text-sm font-medium">Defects Liability Period (Days)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.defectsLiabilityPeriod} 
                                        onChange={e => handleChange('defectsLiabilityPeriod', parseInt(e.target.value) || 0)}
                                        className="h-9 sm:h-10 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="perfSecurity" 
                                    checked={formData.performanceSecurityRequired} 
                                    onCheckedChange={(v) => handleChange('performanceSecurityRequired', v === true)} 
                                />
                                <Label htmlFor="perfSecurity" className="text-xs sm:text-sm font-normal cursor-pointer">Performance Security Required?</Label>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 4: Context */}
                {step === 4 && (
                    <>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Project Context</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Objectives and Outputs (Scope definition comes later)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Key Objectives</Label>
                                <Textarea 
                                    value={formData.keyObjectives} 
                                    onChange={e => handleChange('keyObjectives', e.target.value)} 
                                    placeholder="Main goals and objectives of the project..."
                                    className="resize-none h-24 sm:h-28 text-sm"
                                />
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Expected Output</Label>
                                <Textarea 
                                    value={formData.expectedOutput} 
                                    onChange={e => handleChange('expectedOutput', e.target.value)} 
                                    placeholder="Expected deliverables and outcomes..."
                                    className="resize-none h-24 sm:h-28 text-sm"
                                />
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <>
                         <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Review & Submit</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Please review your project details before submitting</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Name:</span>
                                    <p className="text-gray-900">{formData.name || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Code:</span>
                                    <p className="text-gray-900">{formData.code || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Industry:</span>
                                    <p className="text-gray-900">{formData.industry || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Type:</span>
                                    <p className="text-gray-900">{formData.projectType || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Region:</span>
                                    <p className="text-gray-900">{formData.region || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">District:</span>
                                    <p className="text-gray-900">{formData.district || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Ward:</span>
                                    <p className="text-gray-900">{formData.ward || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Plot:</span>
                                    <p className="text-gray-900">{formData.plotNumber || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Start Date:</span>
                                    <p className="text-gray-900">{formData.startDate || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Completion Date:</span>
                                    <p className="text-gray-900">{formData.expectedCompletionDate || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Contract:</span>
                                    <p className="text-gray-900">{formData.contractType || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-gray-600">Budget:</span>
                                    <p className="text-gray-900">{formData.budgetDisplay ? `${formData.currency} ${parseFloat(formData.budgetDisplay).toLocaleString()}` : '-'}</p>
                                </div>
                            </div>
                            {formData.keyObjectives && (
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1">
                                    <p className="font-semibold text-gray-600 text-xs sm:text-sm">Objectives:</p>
                                    <p className="text-gray-900 text-xs sm:text-sm">{formData.keyObjectives}</p>
                                </div>
                            )}
                            {formData.expectedOutput && (
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1">
                                    <p className="font-semibold text-gray-600 text-xs sm:text-sm">Expected Output:</p>
                                    <p className="text-gray-900 text-xs sm:text-sm">{formData.expectedOutput}</p>
                                </div>
                            )}
                        </CardContent>
                    </>
                )}

                <CardFooter className="flex flex-row justify-between gap-2 sm:gap-3 p-4 sm:p-6 pt-3 sm:pt-4 border-t">
                    {step > 1 ? (
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                        >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Back
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex-1"></div>
                    {step < 5 ? (
                        <Button
                            className='bg-[#2a3455] hover:bg-[#1e253e] text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm px-3 sm:px-4'
                            onClick={nextStep}
                        >
                            Next <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm px-3 sm:px-4"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default ProjectWizard;
