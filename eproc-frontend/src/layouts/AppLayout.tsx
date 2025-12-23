import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LayoutDashboard, Building, ClipboardList, LogOut, User, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      <aside className="w-64 bg-white border-r flex flex-col fixed inset-y-0 z-50 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#2a3455] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
             eP
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-slate-900">eProc</h1>
        </div>
        
        <Separator className="opacity-50" />
        
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
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-slate-100 text-slate-900" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-slate-900" : "text-slate-400")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0.5 h-5 min-w-[1.25rem] flex items-center justify-center">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
             <div className="flex items-start gap-3">
               <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
               <div className="space-y-1">
                 <p className="text-xs font-semibold text-slate-900">Support</p>
                 <p className="text-xs text-slate-500">Need help? Contact admin support.</p>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="bg-white sticky top-0 z-40 border-b h-16 flex items-center px-8 shadow-sm justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pl-3 pr-2 transition-colors outline-none focus:ring-2 focus:ring-slate-200">
                      <div className="flex flex-col items-end text-sm mr-1 hidden sm:flex">
                         <span className="font-semibold text-slate-900 leading-none">{user?.name}</span>
                         <span className="text-xs text-slate-500 capitalize leading-none mt-1">
                           {user?.role?.toLowerCase().replace('_', ' ')}
                         </span>
                      </div>
                      <Avatar className="h-9 w-9 border border-slate-200 shadow-sm cursor-pointer">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56">
                   <DropdownMenuLabel>My Account</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem className="cursor-pointer">
                     <User className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer">
                     <Settings className="mr-2 h-4 w-4" />
                     <span>Settings</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Log out</span>
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
