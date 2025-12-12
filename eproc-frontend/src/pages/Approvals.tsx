import { useAuth } from '../context/AuthContext';
import { ProjectList } from '../components/ProjectList';

/**
 * Approvals / Project Manager Dashboard.
 */
const Approvals = () => {
  const { user, logout } = useAuth();

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

      <ProjectList />

      {/* Stats Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending Approval</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Approved Today</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Rejected</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
