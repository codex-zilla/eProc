import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  location: string;
  projectId: number;
}

interface MaterialItem {
  tempId: string;
  materialName: string;
  quantity: string;
  measurementUnit: string;
  rateEstimate: string;
}

interface LabourItem {
  tempId: string;
  labourType: string;
  quantity: string;
  measurementUnit: string;
  rateEstimate: string;
}

interface BOQEntry {
  tempId: string;
  siteId: string;
  boqDescription: string;
  workDescription: string;
  plannedStart: string;
  plannedEnd: string;
  emergencyFlag: boolean;
  materials: MaterialItem[];
  labour: LabourItem[];
}

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
  { value: 'Days', label: 'Days - Labour duration' },
];

/**
 * Create BOQ Request page for Engineers.
 * Each BOQ is a card with details, materials, and labour.
 */
const CreateBatch = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [boqEntries, setBoqEntries] = useState<BOQEntry[]>([
    {
      tempId: crypto.randomUUID(),
      siteId: '',
      boqDescription: '',
      workDescription: '',
      plannedStart: '',
      plannedEnd: '',
      emergencyFlag: false,
      materials: [
        {
          tempId: crypto.randomUUID(),
          materialName: '',
          quantity: '',
          measurementUnit: '',
          rateEstimate: '',
        },
      ],
      labour: [
        {
          tempId: crypto.randomUUID(),
          labourType: '',
          quantity: '',
          measurementUnit: 'Days',
          rateEstimate: '',
        },
      ],
    },
  ]);

  // Load sites on mount
  useState(() => {
    const loadSites = async () => {
      try {
        const res = await api.get<Site[]>('/sites');
        setSites(res.data);
        if (res.data.length === 1) {
          // Auto-select if only one site
          setBoqEntries(prev => prev.map((entry, idx) => 
            idx === 0 ? { ...entry, siteId: res.data[0].id.toString() } : entry
          ));
        }
      } catch (err) {
        console.error('Failed to load sites:', err);
        setError('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  });

  const addBOQEntry = () => {
    setBoqEntries([
      ...boqEntries,
      {
        tempId: crypto.randomUUID(),
        siteId: '',
        boqDescription: '',
        workDescription: '',
        plannedStart: '',
        plannedEnd: '',
        emergencyFlag: false,
        materials: [
          {
            tempId: crypto.randomUUID(),
            materialName: '',
            quantity: '',
            measurementUnit: '',
            rateEstimate: '',
          },
        ],
        labour: [
          {
            tempId: crypto.randomUUID(),
            labourType: '',
            quantity: '',
            measurementUnit: 'Days',
            rateEstimate: '',
          },
        ],
      },
    ]);
  };

  const removeBOQEntry = (tempId: string) => {
    if (boqEntries.length > 1) {
      setBoqEntries(boqEntries.filter(entry => entry.tempId !== tempId));
    }
  };

  const updateBOQEntry = (tempId: string, field: keyof BOQEntry, value: any) => {
    setBoqEntries(boqEntries.map(entry => 
      entry.tempId === tempId ? { ...entry, [field]: value } : entry
    ));
  };

  const addMaterial = (boqTempId: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          materials: [
            ...entry.materials,
            {
              tempId: crypto.randomUUID(),
              materialName: '',
              quantity: '',
              measurementUnit: '',
              rateEstimate: '',
            },
          ],
        };
      }
      return entry;
    }));
  };

  const removeMaterial = (boqTempId: string, materialTempId: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          materials: entry.materials.filter(m => m.tempId !== materialTempId),
        };
      }
      return entry;
    }));
  };

  const updateMaterial = (boqTempId: string, materialTempId: string, field: keyof MaterialItem, value: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          materials: entry.materials.map(m => 
            m.tempId === materialTempId ? { ...m, [field]: value } : m
          ),
        };
      }
      return entry;
    }));
  };

  const addLabour = (boqTempId: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          labour: [
            ...entry.labour,
            {
              tempId: crypto.randomUUID(),
              labourType: '',
              quantity: '',
              measurementUnit: 'Days',
              rateEstimate: '',
            },
          ],
        };
      }
      return entry;
    }));
  };

  const removeLabour = (boqTempId: string, labourTempId: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          labour: entry.labour.filter(l => l.tempId !== labourTempId),
        };
      }
      return entry;
    }));
  };

  const updateLabour = (boqTempId: string, labourTempId: string, field: keyof LabourItem, value: string) => {
    setBoqEntries(boqEntries.map(entry => {
      if (entry.tempId === boqTempId) {
        return {
          ...entry,
          labour: entry.labour.map(l => 
            l.tempId === labourTempId ? { ...l, [field]: value } : l
          ),
        };
      }
      return entry;
    }));
  };

  const calculateMaterialCost = (boqEntry: BOQEntry) => {
    return boqEntry.materials.reduce((sum, material) => {
      const qty = parseFloat(material.quantity) || 0;
      const rate = parseFloat(material.rateEstimate) || 0;
      return sum + qty * rate;
    }, 0);
  };

  const calculateLabourCost = (boqEntry: BOQEntry) => {
    return boqEntry.labour.reduce((sum, labour) => {
      const qty = parseFloat(labour.quantity) || 0;
      const rate = parseFloat(labour.rateEstimate) || 0;
      return sum + qty * rate;
    }, 0);
  };

  const calculateBOQTotal = (boqEntry: BOQEntry) => {
    return calculateMaterialCost(boqEntry) + calculateLabourCost(boqEntry);
  };

  const calculateGrandTotal = () => {
    return boqEntries.reduce((sum, entry) => sum + calculateBOQTotal(entry), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    for (let i = 0; i < boqEntries.length; i++) {
      const entry = boqEntries[i];
      if (!entry.siteId) {
        setError(`BOQ ${i + 1}: Please select a site`);
        return;
      }
      if (!entry.boqDescription.trim()) {
        setError(`BOQ ${i + 1}: Please enter a BOQ description`);
        return;
      }
      if (entry.materials.length === 0 && entry.labour.length === 0) {
        setError(`BOQ ${i + 1}: Please add at least one material or labour item`);
        return;
      }

      // Validate materials
      for (let j = 0; j < entry.materials.length; j++) {
        const mat = entry.materials[j];
        if (!mat.materialName || !mat.quantity || !mat.measurementUnit || !mat.rateEstimate) {
          setError(`BOQ ${i + 1}, Material ${j + 1}: All fields are required`);
          return;
        }
      }

      // Validate labour
      for (let j = 0; j < entry.labour.length; j++) {
        const lab = entry.labour[j];
        if (!lab.labourType || !lab.quantity || !lab.measurementUnit || !lab.rateEstimate) {
          setError(`BOQ ${i + 1}, Labour ${j + 1}: All fields are required`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      // Create batch payload with all BOQ entries
      const batchPayload = {
        projectId: sites.find(s => s.id === parseInt(boqEntries[0].siteId))?.projectId || 0,
        title: `BOQ Batch - ${boqEntries.length} item(s)`,
        description: boqEntries.map((e, i) => `${i + 1}. ${e.boqDescription}`).join('\n'),
        items: boqEntries.flatMap((entry) => [
          ...entry.materials.map((mat) => ({
            siteId: parseInt(entry.siteId),
            manualMaterialName: mat.materialName,
            workDescription: entry.workDescription || entry.boqDescription,
            measurementUnit: mat.measurementUnit,
            quantity: parseFloat(mat.quantity),
            rateEstimate: parseFloat(mat.rateEstimate),
            resourceType: 'MATERIAL',
            plannedUsageStart: entry.plannedStart ? `${entry.plannedStart}T00:00:00` : new Date().toISOString(),
            plannedUsageEnd: entry.plannedEnd ? `${entry.plannedEnd}T23:59:59` : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            emergencyFlag: entry.emergencyFlag,
          })),
          ...entry.labour.map((lab) => ({
            siteId: parseInt(entry.siteId),
            manualMaterialName: lab.labourType,
            workDescription: entry.workDescription || entry.boqDescription,
            measurementUnit: lab.measurementUnit,
            quantity: parseFloat(lab.quantity),
            rateEstimate: parseFloat(lab.rateEstimate),
            resourceType: 'LABOUR',
            plannedUsageStart: entry.plannedStart ? `${entry.plannedStart}T00:00:00` : new Date().toISOString(),
            plannedUsageEnd: entry.plannedEnd ? `${entry.plannedEnd}T23:59:59` : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            emergencyFlag: entry.emergencyFlag,
          })),
        ]),
      };

      // Create and submit batch
      const createResponse = await api.post('/boq-batches', batchPayload);
      const batchId = createResponse.data.id;

      // Submit the batch for approval
      await api.post(`/boq-batches/${batchId}/submit`);

      navigate('/engineer/batches');
    } catch (err: any) {
      console.error('Failed to submit batch:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to submit batch';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {boqEntries.map((entry, entryIndex) => (
          <Card key={entry.tempId} className="border-2 border-slate-300">
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base text-white">BOQ Entry {entryIndex + 1}</CardTitle>
              {boqEntries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBOQEntry(entry.tempId)}
                  className="h-7 text-xs text-red-200 hover:text-red-100 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove BOQ
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-3 sm:pt-6 space-y-4">
              {/* BOQ Header Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-4 border-b">
                {/* Site Selection */}
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor={`site-${entry.tempId}`} className="text-xs sm:text-sm">
                    Site <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={entry.siteId} 
                    onValueChange={(val) => updateBOQEntry(entry.tempId, 'siteId', val)} 
                    required 
                    disabled={sites.length === 0}
                  >
                    <SelectTrigger id={`site-${entry.tempId}`} className="h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder={sites.length === 0 ? 'No sites available' : 'Select a site...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.length === 0 ? (
                        <SelectItem value="no-sites" disabled className="text-xs sm:text-sm text-muted-foreground">
                          No sites available
                        </SelectItem>
                      ) : (
                        sites.map((site) => (
                          <SelectItem key={site.id} value={site.id.toString()} className="text-xs sm:text-sm">
                            {site.name} - {site.location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Emergency Flag */}
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor={`emergency-${entry.tempId}`} className="text-xs sm:text-sm">
                    Priority
                  </Label>
                  <div className="flex items-center gap-2 h-9 sm:h-10">
                    <input
                      type="checkbox"
                      id={`emergency-${entry.tempId}`}
                      checked={entry.emergencyFlag}
                      onChange={(e) => updateBOQEntry(entry.tempId, 'emergencyFlag', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`emergency-${entry.tempId}`} className="text-xs sm:text-sm flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Mark as Emergency
                    </label>
                  </div>
                </div>

                {/* BOQ Description */}
                <div className="grid gap-1.5 sm:gap-2 sm:col-span-2">
                  <Label htmlFor={`boq-desc-${entry.tempId}`} className="text-xs sm:text-sm">
                    BOQ Task Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`boq-desc-${entry.tempId}`}
                    type="text"
                    value={entry.boqDescription}
                    onChange={(e) => updateBOQEntry(entry.tempId, 'boqDescription', e.target.value)}
                    required
                    placeholder="e.g., Supply, cut, bend and fix reinforcement steel bars for pad foundations"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>

                {/* Work Description (optional details) */}
                <div className="grid gap-1.5 sm:gap-2 sm:col-span-2">
                  <Label htmlFor={`work-desc-${entry.tempId}`} className="text-xs sm:text-sm">
                    Additional Details (Optional)
                  </Label>
                  <Textarea
                    id={`work-desc-${entry.tempId}`}
                    value={entry.workDescription}
                    onChange={(e) => updateBOQEntry(entry.tempId, 'workDescription', e.target.value)}
                    rows={2}
                    placeholder="Additional work details..."
                    className="resize-none text-sm"
                  />
                </div>

                {/* Timeline */}
                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor={`start-${entry.tempId}`} className="text-xs sm:text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Planned Start
                  </Label>
                  <Input
                    id={`start-${entry.tempId}`}
                    type="date"
                    value={entry.plannedStart}
                    onChange={(e) => updateBOQEntry(entry.tempId, 'plannedStart', e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid gap-1.5 sm:gap-2">
                  <Label htmlFor={`end-${entry.tempId}`} className="text-xs sm:text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Planned End
                  </Label>
                  <Input
                    id={`end-${entry.tempId}`}
                    type="date"
                    value={entry.plannedEnd}
                    onChange={(e) => updateBOQEntry(entry.tempId, 'plannedEnd', e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Materials Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded"></div>
                  Materials ({entry.materials.length})
                </h4>

                <div className="overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-2 font-medium">Material Name</th>
                        <th className="text-left p-2 font-medium w-24">Quantity</th>
                        <th className="text-left p-2 font-medium w-28">Unit</th>
                        <th className="text-left p-2 font-medium w-28">Rate (TZS)</th>
                        <th className="text-right p-2 font-medium w-28">Amount</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.materials.map((material) => (
                        <tr key={material.tempId} className="border-t border-slate-200">
                          <td className="p-2">
                            <Input
                              type="text"
                              value={material.materialName}
                              onChange={(e) => updateMaterial(entry.tempId, material.tempId, 'materialName', e.target.value)}
                              placeholder="e.g., Cement, Steel"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={material.quantity}
                              onChange={(e) => updateMaterial(entry.tempId, material.tempId, 'quantity', e.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={material.measurementUnit}
                              onValueChange={(val) => updateMaterial(entry.tempId, material.tempId, 'measurementUnit', val)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {MEASUREMENT_UNITS.filter(u => u.value !== 'Days').map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value} className="text-xs">
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={material.rateEstimate}
                              onChange={(e) => updateMaterial(entry.tempId, material.tempId, 'rateEstimate', e.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2 text-right font-semibold text-xs">
                            {((parseFloat(material.quantity) || 0) * (parseFloat(material.rateEstimate) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                            {entry.materials.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterial(entry.tempId, material.tempId)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addMaterial(entry.tempId)}
                  className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Material
                </Button>

                <div className="bg-blue-50 p-2 rounded flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Materials Total:</span>
                  <span className="text-sm font-bold text-blue-900">
                    TZS {calculateMaterialCost(entry).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Labour Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded"></div>
                  Labour ({entry.labour.length})
                </h4>

                <div className="overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-2 font-medium">Labour Type</th>
                        <th className="text-left p-2 font-medium w-24">Quantity</th>
                        <th className="text-left p-2 font-medium w-28">Unit</th>
                        <th className="text-left p-2 font-medium w-28">Rate (TZS)</th>
                        <th className="text-right p-2 font-medium w-28">Amount</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.labour.map((labour) => (
                        <tr key={labour.tempId} className="border-t border-slate-200">
                          <td className="p-2">
                            <Input
                              type="text"
                              value={labour.labourType}
                              onChange={(e) => updateLabour(entry.tempId, labour.tempId, 'labourType', e.target.value)}
                              placeholder="e.g., Mason, Carpenter"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={labour.quantity}
                              onChange={(e) => updateLabour(entry.tempId, labour.tempId, 'quantity', e.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={labour.measurementUnit}
                              onValueChange={(val) => updateLabour(entry.tempId, labour.tempId, 'measurementUnit', val)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Days" className="text-xs">Days</SelectItem>
                                <SelectItem value="No" className="text-xs">No - Count</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={labour.rateEstimate}
                              onChange={(e) => updateLabour(entry.tempId, labour.tempId, 'rateEstimate', e.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2 text-right font-semibold text-xs">
                            {((parseFloat(labour.quantity) || 0) * (parseFloat(labour.rateEstimate) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                            {entry.labour.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLabour(entry.tempId, labour.tempId)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLabour(entry.tempId)}
                  className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Labour
                </Button>

                <div className="bg-green-50 p-2 rounded flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Labour Total:</span>
                  <span className="text-sm font-bold text-green-900">
                    TZS {calculateLabourCost(entry).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* BOQ Total */}
              <div className="flex items-center justify-between pt-3 border-t bg-slate-50 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2">
                <span className="text-sm font-semibold text-slate-800">BOQ {entryIndex + 1} Total:</span>
                <span className="text-lg font-bold text-indigo-900">
                  TZS {calculateBOQTotal(entry).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Another BOQ Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addBOQEntry}
          className="w-full h-10 text-sm border-2 border-dashed border-slate-300 hover:border-slate-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another BOQ Entry
        </Button>

        {/* Grand Total Summary */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">Total Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between pt-2 bg-indigo-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span className="text-base font-semibold text-slate-800">Grand Total ({boqEntries.length} BOQ{boqEntries.length > 1 ? 's' : ''})</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-indigo-900">
                TZS {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
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
            {submitting ? 'Submitting...' : 'Submit All BOQs'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatch;
