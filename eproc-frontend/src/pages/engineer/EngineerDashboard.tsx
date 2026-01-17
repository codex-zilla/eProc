import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface EngineerDashboardData {
  assignedProjectId: number | null;
  assignedProjectName: string | null;
  projectStatus: string | null;
  bossName: string | null;
  bossEmail: string | null;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalRequests: number;
}

/**
 * Engineer Dashboard - daily operational view.
 */
const EngineerDashboard = () => {
  const [dashboard, setDashboard] = useState<EngineerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await axios.get<EngineerDashboardData>(
          `${API_BASE}/api/dashboard/engineer`,
          { headers: getAuthHeaders() }
        );
        setDashboard(response.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Project Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Project</h2>
        {dashboard?.assignedProjectId ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Link 
                to="/engineer/project" 
                className="text-xl font-medium text-indigo-600 hover:underline"
              >
                {dashboard.assignedProjectName}
              </Link>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                dashboard.projectStatus === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {dashboard.projectStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Project Manager: {dashboard.bossName} ({dashboard.bossEmail})
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No project assigned yet.</p>
            <p className="text-sm text-gray-400">
              Contact your project manager to get assigned to a project.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Total Requests</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.totalRequests || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.pendingRequests || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Approved</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.approvedRequests || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Rejected</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.rejectedRequests || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/engineer/requests"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <span className="text-2xl">📋</span>
            <p className="font-medium mt-2">My Requests</p>
            <p className="text-sm text-gray-500">View all your requests</p>
          </Link>
          <Link
            to="/engineer/project"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <span className="text-2xl">🏗️</span>
            <p className="font-medium mt-2">Project Details</p>
            <p className="text-sm text-gray-500">View assigned project</p>
          </Link>
          <Link
            to="/profile"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <span className="text-2xl">👤</span>
            <p className="font-medium mt-2">My Profile</p>
            <p className="text-sm text-gray-500">Account settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
