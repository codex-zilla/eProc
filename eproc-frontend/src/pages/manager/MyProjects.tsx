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
  engineerId: number | null;
  engineerName: string | null;
  engineerEmail: string | null;
}

/**
 * My Projects page - list of manager's projects.
 */
const MyProjects = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const response = await axios.get<Project[]>(
        `${API_BASE}/api/projects`,
        { headers: getAuthHeaders() }
      );
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Manage your construction projects</p>
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

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-4">🏗️</div>
          <p className="text-gray-500">No projects yet.</p>
          <Link
            to="/manager/projects/new"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`/manager/projects/${project.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Budget:</span> {project.currency} {project.budgetTotal?.toLocaleString() || 0}
                </p>
                <p>
                  <span className="font-medium">Engineer:</span>{' '}
                  {project.engineerName || (
                    <span className="text-yellow-600">Not assigned</span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
