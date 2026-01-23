import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { getExchangeRate, convertToTZS } from '@/lib/currency';
import { getAllRegions, getDistrictData, getWardData } from 'tz-geo-data';

import { getCoordinates } from '@/lib/geocoding';
import { projectService } from '@/services/projectService';
import { Industry, ProjectType, ContractType } from '@/types/models';

const ProjectWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        keyObjectives: '',
        expectedOutput: ''
    });

    const [exchangeRate, setExchangeRate] = useState<number>(2500);
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -6.7924, lng: 39.2083 });
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        getExchangeRate().then(setExchangeRate);
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            updateMapLocation(`${formData.ward}, ${formData.district}, ${formData.region}, Tanzania`);
        } else if (formData.district) {
            updateMapLocation(`${formData.district}, ${formData.region}, Tanzania`);
        } else if (formData.region) {
            updateMapLocation(`${formData.region}, Tanzania`);
        }
    }, [formData.region, formData.district, formData.ward]);

    const handleLocationSelect = (lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
        handleChange('gpsCoordinates', `${lat.toFixed(6)},${lng.toFixed(6)}`);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const budgetVal = parseFloat(formData.budgetDisplay);
            const budgetInTZS = convertToTZS(isNaN(budgetVal) ? 0 : budgetVal, formData.currency, exchangeRate);

            await projectService.createProject({
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
                expectedOutput: formData.expectedOutput
            });
            navigate('/manager/projects');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Derived Lists
    const regions = useMemo(() => getAllRegions(), []);
    const districts = useMemo(() => formData.region ? getDistrictData(formData.region) : [], [formData.region]);
    const wards = useMemo(() => (formData.region && formData.district) ? getWardData(formData.region, formData.district) : [], [formData.region, formData.district]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* <h1 className="text-3xl font-bold mb-6 text-center">New Project Wizard</h1> */}
            
            {/* Steps Indicator */}
            <div className="flex justify-between mb-8 px-10">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                        {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                ))}
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>}

            <Card>
                {/* Step 1: Core Identity */}
                {step === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle>Core Identity</CardTitle>
                            <CardDescription>Basic details to identify the project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Project Name *</Label>
                                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Skyline Apartments" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Project Code</Label>
                                <Input value={formData.code} onChange={e => handleChange('code', e.target.value)} placeholder="e.g. PRJ-2026-001" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Industry</Label>
                                    <Select value={formData.industry} onValueChange={v => handleChange('industry', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Industry" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Industry).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Project Type</Label>
                                    <Select value={formData.projectType} onValueChange={v => handleChange('projectType', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ProjectType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Currency</Label>
                                    <Select value={formData.currency} onValueChange={v => handleChange('currency', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TZS">TZS</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Budget Estimate</Label>
                                    <Input type="number" value={formData.budgetDisplay} onChange={e => handleChange('budgetDisplay', e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Detailed project description..." />
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <>
                        <CardHeader>
                            <CardTitle>Location Details</CardTitle>
                            <CardDescription>Where is the project located?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Region</Label>
                                    <Select value={formData.region} onValueChange={v => handleChange('region', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                                        <SelectContent>
                                            {regions.map(r => <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>District</Label>
                                    <Select value={formData.district} onValueChange={v => handleChange('district', v)} disabled={!formData.region}>
                                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                        <SelectContent>
                                            {districts.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Ward</Label>
                                    <Select value={formData.ward} onValueChange={v => handleChange('ward', v)} disabled={!formData.district}>
                                        <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
                                        <SelectContent>
                                            {wards.map(w => <SelectItem key={w.name} value={w.name}>{w.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Plot Number</Label>
                                <Input value={formData.plotNumber} onChange={e => handleChange('plotNumber', e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="titleDeed" checked={formData.titleDeedAvailable} onCheckedChange={(v: boolean | 'indeterminate') => handleChange('titleDeedAvailable', v === true)} />
                                <Label htmlFor="titleDeed">Title Deed Available?</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label>Pin on Map</Label>
                                <LocationPicker center={mapCenter} markerPosition={markerPosition} onLocationSelect={handleLocationSelect} />
                                {markerPosition && <p className="text-xs text-green-600">Selected: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label>Site Access Notes</Label>
                                <Textarea value={formData.siteAccessNotes} onChange={e => handleChange('siteAccessNotes', e.target.value)} placeholder="e.g. 4x4 required, muddy road..." />
                            </div>

                        </CardContent>
                    </>
                )}

                {/* Step 3: Owner & Timeline */}
                {step === 3 && (
                    <>
                        <CardHeader>
                            <CardTitle>Owner, Timeline & Contract</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Owner Representative Name</Label>
                                <Input value={formData.ownerRepName} onChange={e => handleChange('ownerRepName', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Owner Rep Contact</Label>
                                <Input value={formData.ownerRepContact} onChange={e => handleChange('ownerRepContact', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Expected Completion</Label>
                                    <Input type="date" value={formData.expectedCompletionDate} onChange={e => handleChange('expectedCompletionDate', e.target.value)} />
                                </div>
                            </div>

                            <hr className="my-2" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Contract Type</Label>
                                    <Select value={formData.contractType} onValueChange={v => handleChange('contractType', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ContractType).map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Defects Liability Period (Days)</Label>
                                    <Input type="number" value={formData.defectsLiabilityPeriod} onChange={e => handleChange('defectsLiabilityPeriod', parseInt(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="perfSecurity" checked={formData.performanceSecurityRequired} onCheckedChange={(v) => handleChange('performanceSecurityRequired', v === true)} />
                                <Label htmlFor="perfSecurity">Performance Security Required?</Label>
                            </div>

                        </CardContent>
                    </>
                )}

                {/* Step 4: Context */}
                {step === 4 && (
                    <>
                        <CardHeader>
                            <CardTitle>Project Context</CardTitle>
                            <CardDescription>Objectives and Outputs (Scope definition comes later)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Key Objectives</Label>
                                <Textarea value={formData.keyObjectives} onChange={e => handleChange('keyObjectives', e.target.value)} placeholder="Main goals..." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Expected Output</Label>
                                <Textarea value={formData.expectedOutput} onChange={e => handleChange('expectedOutput', e.target.value)} placeholder="Deliverables..." />
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <>
                         <CardHeader>
                            <CardTitle>Review & Submit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div><strong>Name:</strong> {formData.name}</div>
                                <div><strong>Code:</strong> {formData.code}</div>
                                <div><strong>Industry:</strong> {formData.industry}</div>
                                <div><strong>Type:</strong> {formData.projectType}</div>
                                <div><strong>Region:</strong> {formData.region}</div>
                                <div><strong>Plot:</strong> {formData.plotNumber}</div>
                                <div><strong>Contract:</strong> {formData.contractType}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <p><strong>Objectives:</strong> {formData.keyObjectives}</p>
                            </div>
                        </CardContent>
                    </>
                )}

                <CardFooter className="flex justify-between">
                    {step > 1 && <Button variant="outline" onClick={prevStep}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>}
                    <div className="flex-1"></div>
                    {step < 5 ? (
                        <Button onClick={nextStep} disabled={step === 1 && !formData.name}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default ProjectWizard;
