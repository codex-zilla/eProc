import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteList } from '../components/SiteList';
import { MaterialPicker } from '../components/MaterialPicker';
import type { MaterialSelection } from '../types/models';

/**
 * Site Dashboard page for Engineers.
 */
const SiteDashboard = () => {
  const { user, logout } = useAuth();
  const [lastSelection, setLastSelection] = useState<MaterialSelection | null>(null);

  const handleMaterialChange = (selection: MaterialSelection | null) => {
    setLastSelection(selection);
    console.log('Material Selection:', selection);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

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

      {/* Stats Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending Requests</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Approved</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Deliveries</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export default SiteDashboard;
