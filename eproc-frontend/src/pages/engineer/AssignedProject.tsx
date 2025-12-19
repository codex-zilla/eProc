import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Project {
  id: number;
  name: string;
  currency: string;
  budgetTotal: number;
  status: string;
  bossId: number;
  bossName: string;
  bossEmail: string;
  engineerId: number;
  engineerName: string;
}

/**
 * Assigned Project page - read-only view of the engineer's assigned project.
 */
const AssignedProject = () => {
  const { user, logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await axios.get<Project[]>(
          `${API_BASE}/api/projects`,
          { headers: getAuthHeaders() }
        );
        // Engineer should only see one project they're assigned to
        if (response.data.length > 0) {
          setProject(response.data[0]);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assigned Project</h1>
          <p className="text-gray-600">Project details and information</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/engineer/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back
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

      {project ? (
        <div className="bg-white rounded-lg shadow">
          {/* Project Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded ${
                project.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : project.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Budget</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {project.currency} {project.budgetTotal?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Currency</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">{project.currency}</p>
              </div>
            </div>

            {/* Project Manager Info */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Project Manager
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">👔</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{project.bossName}</p>
                  <p className="text-sm text-gray-500">{project.bossEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {project.status === 'ACTIVE' && (
            <div className="p-6 bg-gray-50 border-t">
              <Link
                to="/engineer/requests/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Create New Request
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-4">🏗️</div>
          <h2 className="text-xl font-semibold text-gray-900">No Project Assigned</h2>
          <p className="text-gray-500 mt-2">
            You have not been assigned to any project yet.
          </p>
          <p className="text-gray-500">
            Please contact your project manager for assignment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedProject;
