import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
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
  engineerId: number | null;
  engineerName: string | null;
  engineerEmail: string | null;
}

interface AvailableEngineer {
  id: number;
  name: string;
  email: string;
}

/**
 * Project Details page - view and manage a single project.
 */
const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [availableEngineers, setAvailableEngineers] = useState<AvailableEngineer[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [projectRes, engineersRes] = await Promise.all([
        axios.get<Project>(`${API_BASE}/api/projects/${id}`, { headers: getAuthHeaders() }),
        axios.get<AvailableEngineer[]>(`${API_BASE}/api/projects/available-engineers`, { headers: getAuthHeaders() }),
      ]);
      setProject(projectRes.data);
      setAvailableEngineers(engineersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignEngineer = async () => {
    if (!selectedEngineerId) return;
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/projects/${id}/engineer`,
        { engineerId: parseInt(selectedEngineerId) },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess('Engineer assigned successfully!');
      setSelectedEngineerId('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign engineer');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/projects/${id}/status`,
        { status: newStatus },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess(`Project marked as ${newStatus}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Project not found</p>
        <Link to="/manager/projects" className="text-indigo-600 hover:underline">Go back</Link>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/manager/projects" className="text-indigo-600 hover:underline text-sm">
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{project.name}</h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError(null)} className="float-right text-red-500">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right text-green-500">×</button>
        </div>
      )}

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Budget</h3>
            <p className="mt-1 text-lg font-medium">{project.currency} {project.budgetTotal?.toLocaleString() || 0}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Project Manager</h3>
            <p className="mt-1 text-lg font-medium">{project.bossName}</p>
          </div>
        </div>
      </div>

      {/* Engineer Assignment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Engineer</h2>
        {project.engineerId ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👷</span>
            </div>
            <div>
              <p className="font-medium">{project.engineerName}</p>
              <p className="text-sm text-gray-500">{project.engineerEmail}</p>
            </div>
          </div>
        ) : project.status === 'ACTIVE' ? (
          <div className="space-y-4">
            <p className="text-yellow-600">No engineer assigned</p>
            <div className="flex gap-2">
              <select
                value={selectedEngineerId}
                onChange={(e) => setSelectedEngineerId(e.target.value)}
                className="flex-1 rounded-md border-gray-300"
              >
                <option value="">Select an engineer...</option>
                {availableEngineers.map(eng => (
                  <option key={eng.id} value={eng.id}>{eng.name} ({eng.email})</option>
                ))}
              </select>
              <button
                onClick={handleAssignEngineer}
                disabled={!selectedEngineerId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
            {availableEngineers.length === 0 && (
              <p className="text-sm text-gray-500">No engineers available for assignment.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No engineer was assigned to this project.</p>
        )}
      </div>

      {/* Pending Requests Link */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Requests</h2>
        <Link
          to={`/manager/pending?projectId=${project.id}`}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          View Pending Requests →
        </Link>
      </div>

      {/* Status Actions */}
      {project.status === 'ACTIVE' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Mark as Completed
            </button>
            <button
              onClick={() => handleUpdateStatus('CANCELLED')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancel Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
