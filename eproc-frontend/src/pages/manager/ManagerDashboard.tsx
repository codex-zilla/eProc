import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface ManagerDashboardData {
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  assignedEngineers: number;
  availableEngineers: number;
}

/**
 * Manager Dashboard - overview of projects and requests.
 */
const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await axios.get<ManagerDashboardData>(
          `${API_BASE}/api/dashboard/manager`,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/manager/projects/new"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            + New Project
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.activeProjects || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <Link to="/manager/pending" className="block">
            <h3 className="font-semibold text-lg">Pending Requests</h3>
            <p className="text-3xl font-bold mt-2">{dashboard?.pendingRequests || 0}</p>
          </Link>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Approved Requests</h3>
          <p className="text-3xl font-bold mt-2">{dashboard?.approvedRequests || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Engineers</h3>
          <p className="text-3xl font-bold mt-2">
            {dashboard?.assignedEngineers || 0} / {(dashboard?.assignedEngineers || 0) + (dashboard?.availableEngineers || 0)}
          </p>
          <p className="text-sm mt-1 opacity-80">
            {dashboard?.availableEngineers || 0} available
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/manager/projects"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏗️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Projects</h3>
              <p className="text-sm text-gray-500">{dashboard?.totalProjects || 0} total projects</p>
            </div>
          </div>
        </Link>

        <Link
          to="/manager/pending"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pending Requests</h3>
              <p className="text-sm text-gray-500">{dashboard?.pendingRequests || 0} awaiting approval</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Profile</h3>
              <p className="text-sm text-gray-500">Account settings</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{dashboard?.totalProjects || 0}</p>
            <p className="text-sm text-gray-500">Total Projects</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{dashboard?.completedProjects || 0}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{dashboard?.rejectedRequests || 0}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{dashboard?.availableEngineers || 0}</p>
            <p className="text-sm text-gray-500">Available Engineers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
