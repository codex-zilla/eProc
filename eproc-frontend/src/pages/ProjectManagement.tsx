import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
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
  role: string;
}

/**
 * Project Management page for PROJECT_MANAGER role.
 * Allows viewing projects, creating new projects, assigning engineers, and updating status.
 */
const ProjectManagement = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableEngineers, setAvailableEngineers] = useState<AvailableEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, engineersRes] = await Promise.all([
        axios.get<Project[]>(`${API_BASE}/api/projects`, { headers: getAuthHeaders() }),
        axios.get<AvailableEngineer[]>(`${API_BASE}/api/projects/available-engineers`, { headers: getAuthHeaders() }),
      ]);
      setProjects(projectsRes.data);
      setAvailableEngineers(engineersRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(
        `${API_BASE}/api/projects`,
        {
          name: newProjectName,
          budgetTotal: parseFloat(newProjectBudget) || 0,
          currency: 'TZS',
        },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess('Project created successfully!');
      setShowCreateForm(false);
      setNewProjectName('');
      setNewProjectBudget('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAssignEngineer = async (projectId: number) => {
    if (!selectedEngineerId) {
      setError('Please select an engineer');
      return;
    }
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/projects/${projectId}/engineer`,
        { engineerId: parseInt(selectedEngineerId) },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess('Engineer assigned successfully!');
      setSelectedProject(null);
      setSelectedEngineerId('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign engineer');
    }
  };

  const handleUpdateStatus = async (projectId: number, newStatus: string) => {
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/api/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      setSuccess(`Project marked as ${newStatus}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            + New Project
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-500">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
          <button onClick={() => setSuccess(null)} className="absolute top-2 right-2 text-green-500">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{projects.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">With Engineer</h3>
          <p className="text-3xl font-bold mt-2">{projects.filter(p => p.engineerId).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Available Engineers</h3>
          <p className="text-3xl font-bold mt-2">{availableEngineers.length}</p>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget (TZS)</label>
                <input
                  type="number"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No projects yet. Create your first project!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      Budget: {project.currency} {project.budgetTotal?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Engineer: {project.engineerName || <span className="text-yellow-600">Not assigned</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Project Actions */}
                {project.status === 'ACTIVE' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!project.engineerId && (
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Assign Engineer
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(project.id, 'COMPLETED')}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(project.id, 'CANCELLED')}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Assign Engineer Form */}
                {selectedProject?.id === project.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Select Engineer</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedEngineerId}
                        onChange={(e) => setSelectedEngineerId(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">-- Select an engineer --</option>
                        {availableEngineers.map((eng) => (
                          <option key={eng.id} value={eng.id}>
                            {eng.name} ({eng.email})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignEngineer(project.id)}
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(null);
                          setSelectedEngineerId('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                    {availableEngineers.length === 0 && (
                      <p className="mt-2 text-sm text-yellow-600">
                        No engineers available. All engineers are assigned to active projects.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
