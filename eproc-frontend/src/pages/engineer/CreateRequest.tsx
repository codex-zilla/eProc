import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

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
}

/**
 * Create/Edit Request page for engineers.
 * - Create: new request for assigned project
 * - Edit: resubmit rejected request (auto-resets to PENDING)
 */
const CreateRequest = () => {
  const { id } = useParams<{ id: string }>(); // Edit mode if ID present
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
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

  const isEditMode = !!id;

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sitesRes, materialsRes] = await Promise.all([
          axios.get<Site[]>(`${API_BASE}/sites`, { headers: getAuthHeaders() }),
          axios.get<Material[]>(`${API_BASE}/materials`, { headers: getAuthHeaders() }),
        ]);
        setSites(sitesRes.data);
        setMaterials(materialsRes.data);

        // Auto-select if only one site
        if (sitesRes.data.length === 1) {
          setSiteId(sitesRes.data[0].id.toString());
        }

        // Load existing request if edit mode
        if (isEditMode) {
          const reqRes = await axios.get<ExistingRequest>(
            `${API_BASE}/requests/${id}`,
            { headers: getAuthHeaders() }
          );
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
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, getAuthHeaders]);

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

    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE}/requests/${id}`,
          payload,
          { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
        );
      } else {
        await axios.post(
          `${API_BASE}/requests`,
          payload,
          { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
        );
      }
      navigate('/engineer/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading form...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isEditMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ✏️ Editing a rejected request. Submitting will reset status to <strong>PENDING</strong>.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Site *</label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
            >
              <option value="">Select a site...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name} - {site.location}</option>
              ))}
            </select>
            {sites.length === 1 && (
              <p className="mt-1 text-sm text-gray-500">Auto-selected (only one site available)</p>
            )}
          </div>

          {/* Material Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useManualMaterial}
                  onChange={() => setUseManualMaterial(false)}
                  className="mr-2"
                />
                Catalog Material
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useManualMaterial}
                  onChange={() => setUseManualMaterial(true)}
                  className="mr-2"
                />
                Manual Entry
              </label>
            </div>
          </div>

          {/* Catalog Material Selection */}
          {!useManualMaterial && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Material *</label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                required={!useManualMaterial}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
              >
                <option value="">Select a material...</option>
                {materials.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({mat.unit}) - Est. {mat.estimatedPrice}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Material Entry */}
          {useManualMaterial && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Material Name *</label>
                <input
                  type="text"
                  value={manualMaterialName}
                  onChange={(e) => setManualMaterialName(e.target.value)}
                  required={useManualMaterial}
                  placeholder="e.g., Custom Steel Beam"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    placeholder="e.g., pcs, kg, m"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Est. Price</label>
                  <input
                    type="number"
                    value={manualEstimatedPrice}
                    onChange={(e) => setManualEstimatedPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity *</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="Enter quantity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Planned Start</label>
              <input
                type="datetime-local"
                value={plannedUsageStart}
                onChange={(e) => setPlannedUsageStart(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Planned End</label>
              <input
                type="datetime-local"
                value={plannedUsageEnd}
                onChange={(e) => setPlannedUsageEnd(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Emergency Flag */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emergency"
              checked={emergencyFlag}
              onChange={(e) => setEmergencyFlag(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="emergency" className="ml-2 text-sm text-gray-700">
              🚨 Mark as <strong>Emergency/Urgent</strong>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Link
              to="/engineer/requests"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#2a3455] text-white rounded-md hover:bg-[#1e253e] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : (isEditMode ? 'Resubmit Request' : 'Create Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
