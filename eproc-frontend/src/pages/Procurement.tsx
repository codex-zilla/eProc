import { useAuth } from '../context/AuthContext';

/**
 * Procurement page for Accountants.
 */
const Procurement = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Accountant View</h2>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>
        </div>
        <p className="text-gray-600">
          This is the Accountant's procurement dashboard. PO generation and invoice tracking will be added in Phase 4.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Total Spend</h3>
          <p className="text-3xl font-bold mt-2">TZS 0</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg">Invoices</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export default Procurement;
