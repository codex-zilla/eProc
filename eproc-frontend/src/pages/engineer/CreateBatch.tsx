import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, Upload, DollarSign } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  location: string;
  projectId: number;
}

interface BatchItem {
  tempId: string;
  boqReferenceCode: string;
  workDescription: string;
  measurementUnit: string;
  quantity: string;
  rateEstimate: string;
  rateType: string;
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
];



/**
 * Create Batch Request page for Engineers.
 * Allows submitting multiple material requests in a single batch.
 */
const CreateBatch = () => {
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch header fields
  const [siteId, setSiteId] = useState<string>('');
  const [batchTitle, setBatchTitle] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  // TODO: Implement file upload functionality
  // const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Batch items
  const [items, setItems] = useState<BatchItem[]>([
    {
      tempId: crypto.randomUUID(),
      boqReferenceCode: '',
      workDescription: '',
      measurementUnit: '',
      quantity: '',
      rateEstimate: '',
      rateType: 'ENGINEER_ESTIMATE',
    },
  ]);

  // Load sites on mount
  useState(() => {
    const loadSites = async () => {
      try {
        const res = await api.get<Site[]>('/sites');
        setSites(res.data);
        if (res.data.length === 1) {
          setSiteId(res.data[0].id.toString());
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

  const addItem = () => {
    setItems([
      ...items,
      {
        tempId: crypto.randomUUID(),
        boqReferenceCode: '',
        workDescription: '',
        measurementUnit: '',
        quantity: '',
        rateEstimate: '',
        rateType: 'ENGINEER_ESTIMATE',
      },
    ]);
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof BatchItem, value: string) => {
    setItems(
      items.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rateEstimate) || 0;
      return sum + qty * rate;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!siteId) {
      setError('Please select a site');
      return;
    }
    if (!batchTitle.trim()) {
      setError('Please enter a batch title');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.boqReferenceCode || !item.workDescription || !item.measurementUnit || !item.quantity || !item.rateEstimate) {
        setError(`Item ${i + 1}: All fields are required`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Create batch with all items
      const batchPayload = {
        projectId: sites.find(s => s.id === parseInt(siteId))?.projectId || 0,
        title: batchTitle,
        description: batchDescription,
        items: items.map((item) => ({
          siteId: parseInt(siteId),
          boqReferenceCode: item.boqReferenceCode,
          workDescription: item.workDescription,
          measurementUnit: item.measurementUnit,
          quantity: parseFloat(item.quantity),
          rateEstimate: parseFloat(item.rateEstimate),
          rateType: item.rateType,
          // Default values for required fields
          plannedUsageStart: new Date().toISOString(),
          plannedUsageEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          emergencyFlag: false,
        })),
      };

      // Create and submit batch
      const createResponse = await api.post('/boq-batches', batchPayload);
      const batchId = createResponse.data.id;

      // Submit the batch for approval
      await api.post(`/boq-batches/${batchId}/submit`);

      navigate('/engineer/batches');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit batch');
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
        {/* Batch Header */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-3 sm:pt-6">
            {/* Site Selection */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="site" className="text-xs sm:text-sm">
                Site <span className="text-red-500">*</span>
              </Label>
              <Select value={siteId} onValueChange={setSiteId} required disabled={sites.length === 0}>
                <SelectTrigger id="site" className="h-9 sm:h-10 text-xs sm:text-sm">
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

            {/* Batch Title */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="batchTitle" className="text-xs sm:text-sm">
                Batch Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batchTitle"
                type="text"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                required
                placeholder="e.g., Foundation Works - Zone A"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            {/* Batch Description */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="batchDescription" className="text-xs sm:text-sm">
                Description (Optional)
              </Label>
              <Textarea
                id="batchDescription"
                value={batchDescription}
                onChange={(e) => setBatchDescription(e.target.value)}
                rows={3}
                placeholder="Additional context for this batch request..."
                className="resize-none text-sm"
              />
            </div>

            {/* Attachment Upload */}
            <div className="grid gap-1.5 sm:gap-2">
              <Label htmlFor="attachment" className="text-xs sm:text-sm">
                Attachment (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={(e) => { /* TODO: Implement file upload */ }}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
                <Upload className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Upload photos, PDFs, or Excel sheets (Max 20MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#2a3455] rounded-t-lg">
            <CardTitle className="text-sm sm:text-base text-white">Request Items</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-3 sm:pt-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.tempId} className="p-3 sm:p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.tempId)}
                        className="h-7 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* BOQ Code */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">BOQ Code *</Label>
                      <Input
                        type="text"
                        value={item.boqReferenceCode}
                        onChange={(e) => updateItem(item.tempId, 'boqReferenceCode', e.target.value.toUpperCase())}
                        placeholder="BOQ-03-RC-001"
                        pattern="^BOQ-\d{2}-[A-Z]{2,4}-\d{3}$"
                        className="h-9 text-sm font-mono"
                      />
                    </div>

                    {/* Measurement Unit */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Unit *</Label>
                      <Select
                        value={item.measurementUnit}
                        onValueChange={(val) => updateItem(item.tempId, 'measurementUnit', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MEASUREMENT_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value} className="text-xs">
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Work Description */}
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Work Description *</Label>
                    <Textarea
                      value={item.workDescription}
                      onChange={(e) => updateItem(item.tempId, 'workDescription', e.target.value)}
                      placeholder="Detailed description of work item..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Quantity */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId, 'quantity', e.target.value)}
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Rate */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Rate (TZS) *</Label>
                      <Input
                        type="number"
                        value={item.rateEstimate}
                        onChange={(e) => updateItem(item.tempId, 'rateEstimate', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Total (Computed) */}
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Total</Label>
                      <div className="h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                        {((parseFloat(item.quantity) || 0) * (parseFloat(item.rateEstimate) || 0)).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="w-full h-9 text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Batch Summary */}
        <Card>
          <CardContent className="p-3 sm:p-4 bg-indigo-50 border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Batch Total:</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-indigo-900">
                TZS {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">{items.length} item(s) in this batch</p>
          </CardContent>
        </Card>

        {/* Debug Card - Authentication Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4">
            <h4 className="text-xs font-semibold text-blue-900 mb-2">🔍 Debug: Authentication Status</h4>
            <div className="space-y-1 text-xs text-blue-800 font-mono">
              <div>
                <span className="font-semibold">Token exists:</span>{' '}
                {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <span className="font-semibold">Token:</span>{' '}
                {localStorage.getItem('token') 
                  ? `${localStorage.getItem('token')?.substring(0, 20)}...` 
                  : 'null'}
              </div>
              <div>
                <span className="font-semibold">User:</span>{' '}
                {localStorage.getItem('user') || 'null'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/engineer/requests')} className="h-9 sm:h-10 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Batch'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatch;
