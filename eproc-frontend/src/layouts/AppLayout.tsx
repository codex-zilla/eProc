import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface SidebarItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch pending count for manager badge
  useEffect(() => {
    if (user?.role === 'PROJECT_MANAGER') {
      const fetchPending = async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/dashboard/manager`, { headers: getAuthHeaders() });
          setPendingCount(res.data.pendingRequests || 0);
        } catch (e) {
          // Ignore errors
        }
      };
      fetchPending();
    }
  }, [user, getAuthHeaders]);

  const getNavItems = (): SidebarItem[] => {
    if (user?.role === 'ENGINEER') {
      return [
        { label: 'Dashboard', path: '/engineer/dashboard', icon: '📊' },
        { label: 'My Project', path: '/engineer/project', icon: '🏗️' },
        { label: 'My Requests', path: '/engineer/requests', icon: '📋' },
      ];
    }
    if (user?.role === 'PROJECT_MANAGER') {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: '📊' },
        { label: 'Projects', path: '/manager/projects', icon: '🏗️' },
        { label: 'Pending Requests', path: '/manager/pending', icon: '⏳', badge: pendingCount },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-indigo-600">eProc TZ</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 text-sm"
          >
            <span>👤</span>
            <span>Profile</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h2>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
