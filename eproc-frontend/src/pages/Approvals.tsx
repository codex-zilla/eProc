import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectList } from '../components/ProjectList';
import ApprovalQueue from '../components/ApprovalQueue';
import { requestService } from '../services/requestService';
import type { MaterialRequest } from '../types/models';

/**
 * Approvals / Project Manager Dashboard.
 */
const Approvals = () => {
  const { user, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<MaterialRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const pending = await requestService.getPendingRequests();
      setPendingRequests(pending);
      
      // Get all requests for stats
      const allRequests = await requestService.getRequests({});
      const statsData = {
        pending: allRequests.filter(r => r.status === 'PENDING').length,
        approved: allRequests.filter(r => r.status === 'APPROVED').length,
        rejected: allRequests.filter(r => r.status === 'REJECTED').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Manager Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending Approval</h3>
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

      {/* Approval Queue */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : (
        <ApprovalQueue 
          requests={pendingRequests} 
          onRequestUpdated={loadRequests}
        />
      )}

      <ProjectList />
    </div>
  );
};

export default Approvals;
