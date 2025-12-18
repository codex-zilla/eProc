import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteList } from '../components/SiteList';
import { MaterialPicker } from '../components/MaterialPicker';
import RequestWizard from '../components/RequestWizard';
import RequestList from '../components/RequestList';
import { requestService } from '../services/requestService';
import type { MaterialSelection, MaterialRequest, Material, Site } from '../types/models';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Site Dashboard page for Engineers.
 */
const SiteDashboard = () => {
  const { user, logout } = useAuth();
  const [lastSelection, setLastSelection] = useState<MaterialSelection | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [myRequests, setMyRequests] = useState<MaterialRequest[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load user's requests
      const requests = await requestService.getMyRequests();
      setMyRequests(requests);

      // Calculate stats
      const statsData = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
      };
      setStats(statsData);

      // Load sites and materials for the wizard
      const [sitesRes, materialsRes] = await Promise.all([
        axios.get<Site[]>(`${API_BASE}/api/sites`, { headers: getAuthHeaders() }),
        axios.get<Material[]>(`${API_BASE}/api/materials`, { headers: getAuthHeaders() }),
      ]);
      setSites(sitesRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMaterialChange = (selection: MaterialSelection | null) => {
    setLastSelection(selection);
    console.log('Material Selection:', selection);
  };

  const handleRequestSuccess = () => {
    setShowWizard(false);
    loadData();
  };

  const handleRequestClick = (request: MaterialRequest) => {
    // If rejected, user can edit/resubmit - for now just log
    if (request.status === 'REJECTED') {
      console.log('Clicked rejected request:', request.id);
      // TODO: Open edit modal for resubmission
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            + New Request
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending Requests</h3>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Approved</h3>
          <p className="text-3xl font-bold mt-2">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Rejected</h3>
          <p className="text-3xl font-bold mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Request Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <RequestWizard
              sites={sites}
              materials={materials}
              onSuccess={handleRequestSuccess}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        </div>
      )}

      {/* My Requests List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : (
        <RequestList
          requests={myRequests}
          currentUserEmail={user?.email}
          onRequestClick={handleRequestClick}
        />
      )}

      {/* Material Picker Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Picker Demo</h2>
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <MaterialPicker onChange={handleMaterialChange} />
          
          <div className="mt-4 p-2 bg-gray-800 text-green-400 text-xs rounded font-mono">
            DEBUG OUTPUT: <br/>  
            {lastSelection ? JSON.stringify(lastSelection, null, 2) : 'No selection'}
          </div>
        </div>
      </div>

      <SiteList />
    </div>
  );
};

export default SiteDashboard;
