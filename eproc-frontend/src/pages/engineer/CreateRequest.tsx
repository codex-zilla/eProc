import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, DollarSign } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  location: string;
}

interface Material {
  id: number;
  name: string;
  unit: string;
  estimatedPrice: number;
}

interface ExistingRequest {
  id: number;
  siteId: number;
  materialId?: number;
  manualMaterialName?: string;
  manualUnit?: string;
  manualEstimatedPrice?: number;
  quantity: number;
  emergencyFlag: boolean;
  plannedUsageStart?: string;
  plannedUsageEnd?: string;
  // BOQ fields
  boqReferenceCode?: string;
  workDescription?: string;
  measurementUnit?: string;
  rateEstimate?: number;
  rateType?: string;
}

// Constrained measurement units (industry standard + Tanzania-specific)
const MEASUREMENT_UNITS = [
  { value: 'm³', label: 'm³ - Cubic Meter' },
  { value: 'm²', label: 'm² - Square Meter' },
  { value: 'm', label: 'm - Linear Meter' },
  { value: 'kg', label: 'kg - Kilogram' },
  { value: 'ton', label: 'ton - Metric Ton' },
  { value: 'No', label: 'No - Number (count)' },
  { value: 'LS', label: 'LS - Lump Sum' },
  { value: 'bag', label: 'bag - Bag (cement, aggregates)' },
  { value: 'bundle', label: 'bundle - Bundle (reinforcement)' },
  { value: 'trip', label: 'trip - Trip (lorry deliveries)' },
  { value: 'drum', label: 'drum - Drum (bitumen/asphalt)' },
  { value: 'pcs', label: 'pcs - Pieces' },
];

const RATE_TYPES = [
  { value: 'ENGINEER_ESTIMATE', label: 'Engineer Estimate' },
  { value: 'MARKET_RATE', label: 'Market Rate' },
  { value: 'TENDER_RATE', label: 'Tender Rate' },
];

/**
 * Create/Edit BOQ Item Request page for engineers.
 * Phase 1: Enhanced with BOQ fields for structured work item requests.
 */
const CreateRequest = () => {
  const { id } = useParams<{ id: string }>(); // Edit mode if ID present
  const navigate = useNavigate();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - existing fields
  const [siteId, setSiteId] = useState<string>('');
  const [useManualMaterial, setUseManualMaterial] = useState(false);
  const [materialId, setMaterialId] = useState<string>('');
  const [manualMaterialName, setManualMaterialName] = useState('');
  const [manualUnit, setManualUnit] = useState('');
  const [manualEstimatedPrice, setManualEstimatedPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [emergencyFlag, setEmergencyFlag] = useState(false);
  const [plannedUsageStart, setPlannedUsageStart] = useState('');
  const [plannedUsageEnd, setPlannedUsageEnd] = useState('');

  // Form state - BOQ fields (Phase 1)
  const [boqReferenceCode, setBoqReferenceCode] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [rateEstimate, setRateEstimate] = useState('');
  const [rateType, setRateType] = useState('ENGINEER_ESTIMATE');

  const isEditMode = !!id;

  // Computed total estimate (real-time calculation)
  const totalEstimate = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const rate = parseFloat(rateEstimate) || 0;
    return qty * rate;
  }, [quantity, rateEstimate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sitesRes, materialsRes] = await Promise.all([
          api.get<Site[]>('/sites'),
          api.get<Material[]>('/materials'),
        ]);
        setSites(sitesRes.data);
        setMaterials(materialsRes.data);

        // Auto-select if only one site
        if (sitesRes.data.length === 1) {
          setSiteId(sitesRes.data[0].id.toString());
        }

        // Load existing request if edit mode
        if (isEditMode) {
          const reqRes = await api.get<ExistingRequest>(`/requests/${id}`);
          const req = reqRes.data;
          setSiteId(req.siteId.toString());
          setQuantity(req.quantity.toString());
          setEmergencyFlag(req.emergencyFlag);
          if (req.plannedUsageStart) setPlannedUsageStart(req.plannedUsageStart.slice(0, 16));
          if (req.plannedUsageEnd) setPlannedUsageEnd(req.plannedUsageEnd.slice(0, 16));
          
          if (req.materialId) {
            setMaterialId(req.materialId.toString());
            setUseManualMaterial(false);
          } else {
            setUseManualMaterial(true);
            setManualMaterialName(req.manualMaterialName || '');
            setManualUnit(req.manualUnit || '');
            setManualEstimatedPrice(req.manualEstimatedPrice?.toString() || '');
          }

          // Load BOQ fields
          setBoqReferenceCode(req.boqReferenceCode || '');
          setWorkDescription(req.workDescription || '');
          setMeasurementUnit(req.measurementUnit || '');
          setRateEstimate(req.rateEstimate?.toString() || '');
          setRateType(req.rateType || 'ENGINEER_ESTIMATE');
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: any = {
      siteId: parseInt(siteId),
      quantity: parseFloat(quantity),
      emergencyFlag,
    };

    if (plannedUsageStart) payload.plannedUsageStart = plannedUsageStart;
    if (plannedUsageEnd) payload.plannedUsageEnd = plannedUsageEnd;

    if (useManualMaterial) {
      payload.manualMaterialName = manualMaterialName;
      payload.manualUnit = manualUnit;
      if (manualEstimatedPrice) payload.manualEstimatedPrice = parseFloat(manualEstimatedPrice);
    } else {
      payload.materialId = parseInt(materialId);
    }

    // Add BOQ fields if provided
    if (boqReferenceCode) payload.boqReferenceCode = boqReferenceCode;
    if (workDescription) payload.workDescription = workDescription;
    if (measurementUnit) payload.measurementUnit = measurementUnit;
    if (rateEstimate) payload.rateEstimate = parseFloat(rateEstimate);
    if (rateType) payload.rateType = rateType;

    try {
      if (isEditMode) {
        await api.put(`/requests/${id}`, payload, { headers: { 'Content-Type': 'application/json' } });
      } else {
        await api.post('/requests', payload, { headers: { 'Content-Type': 'application/json' } });
      }
      navigate('/engineer/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isEditMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <p>
            ✏️ Editing a rejected request. Submitting will reset status to <strong>PENDING</strong>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Section 1: BOQ Context */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">BOQ Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-3 sm:pt-6">
            {/* Site Selection */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="site" className="text-xs sm:text-sm">
                Site <span className="text-red-500">*</span>
              </Label>
              <Select value={siteId} onValueChange={setSiteId} required>
                <SelectTrigger id="site" className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Select a site..." />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id.toString()} className="text-xs sm:text-sm">
                      {site.name} - {site.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sites.length === 1 && (
                <p className="text-[10px] sm:text-xs text-muted-foreground">Auto-selected (only one site available)</p>
              )}
            </div>

            {/* BOQ Item Code */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="boqCode" className="text-xs sm:text-sm">
                BOQ Item Code
                <span className="ml-2 text-[10px] sm:text-xs text-muted-foreground font-normal">
                  (Pattern: BOQ-{'{section}'}-{'{trade}'}-{'{sequence}'} e.g., BOQ-03-RC-001)
                </span>
              </Label>
              <Input
                id="boqCode"
                type="text"
                value={boqReferenceCode}
                onChange={(e) => setBoqReferenceCode(e.target.value.toUpperCase())}
                placeholder="BOQ-03-RC-001"
                pattern="^BOQ-\d{2}-[A-Z]{2,4}-\d{3}$"
                className="h-9 sm:h-10 text-sm font-mono"
              />
            </div>

            {/* Work Description */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="workDescription" className="text-xs sm:text-sm">
                Work Description
                {boqReferenceCode && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                required={!!boqReferenceCode}
                minLength={10}
                rows={4}
                placeholder="Detailed description of the work item (minimum 10 characters)"
                className="resize-none text-sm"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">{workDescription.length} characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Measurement & Quantity */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">Measurement & Quantity</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-3 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Measurement Unit */}
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="measurementUnit" className="text-xs sm:text-sm">
                  Measurement Unit
                  {boqReferenceCode && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit} required={!!boqReferenceCode}>
                  <SelectTrigger id="measurementUnit" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MEASUREMENT_UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value} className="text-xs sm:text-sm">
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="quantity" className="text-xs sm:text-sm">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter quantity"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Cost Information */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">Cost Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-3 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Rate Type */}
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="rateType" className="text-xs sm:text-sm">Rate Type</Label>
                <Select value={rateType} onValueChange={setRateType}>
                  <SelectTrigger id="rateType" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rate Estimate */}
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="rateEstimate" className="text-xs sm:text-sm">
                  Rate Estimate (TZS per unit)
                </Label>
                <Input
                  id="rateEstimate"
                  type="number"
                  value={rateEstimate}
                  onChange={(e) => setRateEstimate(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            {/* Total Estimate (Computed, Read-only) */}
            {rateEstimate && quantity && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Total Estimate:</span>
                  </div>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-900">
                    TZS {totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 mt-1 sm:mt-2">
                  = {quantity} {measurementUnit || 'units'} × TZS {parseFloat(rateEstimate).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Material Breakdown (Optional) */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-white">
              Material Breakdown (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-3 sm:pt-6">
            {/* Material Type Toggle */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label className="text-xs sm:text-sm">Material Type</Label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!useManualMaterial}
                    onChange={() => setUseManualMaterial(false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-slate-700">Catalog Material</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={useManualMaterial}
                    onChange={() => setUseManualMaterial(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-slate-700">Manual Entry</span>
                </label>
              </div>
            </div>

            {/* Catalog Material Selection */}
            {!useManualMaterial && (
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="material" className="text-xs sm:text-sm">Material</Label>
                <Select value={materialId} onValueChange={setMaterialId}>
                  <SelectTrigger id="material" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select a material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(mat => (
                      <SelectItem key={mat.id} value={mat.id.toString()} className="text-xs sm:text-sm">
                        {mat.name} ({mat.unit}) - Est. {mat.estimatedPrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manual Material Entry */}
            {useManualMaterial && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor="manualMaterialName" className="text-xs sm:text-sm">Material Name</Label>
                  <Input
                    id="manualMaterialName"
                    type="text"
                    value={manualMaterialName}
                    onChange={(e) => setManualMaterialName(e.target.value)}
                    placeholder="e.g., Custom Steel Beam"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="manualUnit" className="text-xs sm:text-sm">Unit</Label>
                    <Input
                      id="manualUnit"
                      type="text"
                      value={manualUnit}
                      onChange={(e) => setManualUnit(e.target.value)}
                      placeholder="e.g., pcs, kg, m"
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5 sm:gap-2">
                    <Label htmlFor="manualEstimatedPrice" className="text-xs sm:text-sm">Est. Price</Label>
                    <Input
                      id="manualEstimatedPrice"
                      type="number"
                      value={manualEstimatedPrice}
                      onChange={(e) => setManualEstimatedPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Timeline & Priority */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-white">
              Timeline & Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-3 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="plannedStart" className="text-xs sm:text-sm">Planned Start</Label>
                <Input
                  id="plannedStart"
                  type="datetime-local"
                  value={plannedUsageStart}
                  onChange={(e) => setPlannedUsageStart(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div className="grid gap-1.5 sm:gap-2">
                <Label htmlFor="plannedEnd" className="text-xs sm:text-sm">Planned End</Label>
                <Input
                  id="plannedEnd"
                  type="datetime-local"
                  value={plannedUsageEnd}
                  onChange={(e) => setPlannedUsageEnd(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Emergency Flag */}
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <input
                type="checkbox"
                id="emergency"
                checked={emergencyFlag}
                onChange={(e) => setEmergencyFlag(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="emergency" className="text-xs sm:text-sm text-red-900 font-medium cursor-pointer">
                Mark as <strong>Emergency/Urgent</strong>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/engineer/requests')}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : (isEditMode ? 'Resubmit Request' : 'Create Request')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
