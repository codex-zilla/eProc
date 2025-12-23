import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LayoutDashboard, Building, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
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
        { label: 'Dashboard', path: '/engineer/dashboard', icon: LayoutDashboard },
        { label: 'My Project', path: '/engineer/project', icon: Building },
        { label: 'My Requests', path: '/engineer/requests', icon: ClipboardList },
      ];
    }
    if (user?.role === 'PROJECT_MANAGER') {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/manager/projects', icon: Building },
        { label: 'Pending Requests', path: '/manager/pending', icon: ClipboardList, badge: pendingCount },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-primary">eProc TZ</h1>
        </div>
        
        <Separator />
        
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 h-5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div className="p-4">
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
               <span className="font-medium">{user?.name}</span>
               <span className="text-xs text-muted-foreground capitalize">
                 {user?.role?.toLowerCase().replace('_', ' ')}
               </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b h-16 flex items-center px-6">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h2>
            <div className="ml-auto flex items-center gap-4">
               {/* Could add notifications or other header actions here */}
            </div>
        </header>
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
