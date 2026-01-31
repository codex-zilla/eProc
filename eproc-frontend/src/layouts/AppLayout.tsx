import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { 
  LayoutDashboard, 
  Building, 
  ClipboardList, 
  LogOut, 
  User, 
  Settings, 
  AlertCircle,
  ChevronLeft,
  Users,
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Mobile: < 768px
      // Tablet: 768px - 1024px (collapsed sidebar)
      // Desktop: > 1024px (expanded sidebar)
      setIsMobile(width < 768);
      if (width < 768) {
        // Mobile - sidebar hidden, use hamburger menu
        setIsMobileMenuOpen(false);
      } else if (width < 1024) {
        // Tablet - collapsed sidebar
        setIsSidebarCollapsed(true);
      } else {
        // Desktop - expanded sidebar
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch pending count for manager badge
  useEffect(() => {
    if (user?.role === 'PROJECT_OWNER') {
      const fetchPending = async () => {
        try {
          const res = await api.get('/dashboard/manager');
          setPendingCount(res.data.pendingRequests || 0);
        } catch (e) {
          // Ignore errors
        }
      };
      fetchPending();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = (): SidebarItem[] => {
    if (user?.role === 'ENGINEER') {
      return [
        { label: 'Dashboard', path: '/engineer/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/engineer/project', icon: Building },
        { label: 'Requests', path: '/engineer/requests', icon: ClipboardList },
      ];
    }
    if (user?.role === 'PROJECT_OWNER') {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/manager/projects', icon: Briefcase },
        { label: 'Project Users', path: '/manager/users', icon: Users },
        { label: 'Pending Requests', path: '/manager/pending', icon: ClipboardList, badge: pendingCount },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Breadcrumb Logic
  const breadcrumbs: { label: string; path?: string; active?: boolean }[] = [];
  
  // Find key root section
  const activeNavItem = navItems.find(i => location.pathname.startsWith(i.path));
  
  if (activeNavItem) {
    // Level 1: Sidebar Item
    breadcrumbs.push({
      label: activeNavItem.label,
      path: activeNavItem.path,
      active: location.pathname === activeNavItem.path
    });

    // Level 2: Sub-pages
    // Hardcoded logic for now as requested, can be made recursive later
    if (location.pathname === '/manager/projects/new') {
       breadcrumbs[0].active = false; // Parent is no longer active
       breadcrumbs.push({
         label: 'Create New Project',
         active: true
       });
    } else if (/^\/manager\/projects\/\d+$/.test(location.pathname)) {
        breadcrumbs[0].active = false;
        breadcrumbs.push({
            label: 'Project Details',
            active: true
        });
    } else if (location.pathname === '/manager/users') {
        // No sub-breadcrumb needed, already handled by activeNavItem
    }

    // Engineer Routes Logic
    if (location.pathname === '/engineer/requests/new') {
        if (breadcrumbs.length > 0) breadcrumbs[0].active = false;
        breadcrumbs.push({
            label: 'Create New Request',
            active: true
        });
    } else if (/^\/engineer\/requests\/\d+$/.test(location.pathname)) {
        if (breadcrumbs.length > 0) breadcrumbs[0].active = false;
        breadcrumbs.push({
            label: 'Request Details',
            active: true
        });
    } else if (/^\/engineer\/requests\/\d+\/edit$/.test(location.pathname)) {
         if (breadcrumbs.length > 0) breadcrumbs[0].active = false;
         breadcrumbs.push({
             label: 'Edit Request',
             active: true
         });
    }
    // Add other sub-page logic here if needed
  } else {
    // Fallback
    breadcrumbs.push({ label: 'Dashboard', active: true });
  }

  // Sidebar content component (reused for both desktop and mobile)
  const SidebarContent = ({ showCloseButton = false }: { showCloseButton?: boolean }) => (
    <>
      <div className={cn(
        "flex items-center gap-3 relative transition-all",
        isSidebarCollapsed && !isMobileMenuOpen ? "p-4 justify-center" : "p-4 sm:p-6"
      )}>
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#2a3455] flex items-center justify-center text-white font-serif font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
           eP
        </div>
        {(!isSidebarCollapsed || isMobileMenuOpen) && (
          <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-slate-900 whitespace-nowrap overflow-hidden">eProc</h1>
        )}
        
        {/* Close button for mobile */}
        {showCloseButton && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus:outline-none"
          >
             <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Collapse button for desktop/tablet */}
        {!isMobile && !showCloseButton && (
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 sm:top-7 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-colors focus:outline-none"
          >
             <ChevronLeft className={cn("h-3 w-3 transition-transform", isSidebarCollapsed && "rotate-180")} />
          </button>
        )}
      </div>
      
      <Separator className="opacity-50" />
      
      <div className="flex-1 py-4 sm:py-6 px-2 sm:px-3 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group relative",
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isSidebarCollapsed && !isMobileMenuOpen && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")} />
                
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                )}

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <div className={cn(
                    "flex items-center justify-center bg-red-500 text-white rounded-full font-bold shadow-sm ring-2 ring-white",
                     isSidebarCollapsed && !isMobileMenuOpen
                      ? "absolute top-1 right-1 h-2.5 w-2.5 p-0" 
                      : "ml-auto px-1.5 py-0.5 h-5 min-w-[1.25rem] text-[10px]"
                  )}>
                    {(!isSidebarCollapsed || isMobileMenuOpen) && item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 sm:p-4 mt-auto">
        {(!isSidebarCollapsed || isMobileMenuOpen) ? (
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-100">
             <div className="flex items-start gap-2 sm:gap-3">
               <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
               <div className="space-y-1 overflow-hidden">
                 <p className="text-xs font-semibold text-slate-900">Support</p>
                 <p className="text-xs text-slate-500 truncate">Contact admin.</p>
               </div>
             </div>
          </div>
        ) : (
          <div className="flex justify-center">
             <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 cursor-help" title="Support">
                <AlertCircle className="h-5 w-5 text-indigo-500" />
             </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Slide-in from left) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent showCloseButton={true} />
      </aside>

      {/* Desktop/Tablet Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r flex-col fixed inset-y-0 z-50 shadow-sm transition-all duration-300 ease-in-out hidden md:flex",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          // Mobile: no margin (sidebar is overlay)
          // Tablet: collapsed sidebar margin
          // Desktop: full or collapsed sidebar margin
          "ml-0 md:ml-20",
          !isSidebarCollapsed && "lg:ml-64"
        )}
      >
        <header className="bg-white sticky top-0 z-40 border-b h-14 sm:h-16 flex items-center px-3 sm:px-6 lg:px-8 shadow-sm justify-between">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus:outline-none"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="flex items-center text-sm sm:text-base lg:text-lg tracking-tight text-slate-900">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                     <span className="mx-1 text-slate-400 font-light">/</span>
                  )}
                  {crumb.path && !crumb.active ? (
                    <Link 
                      to={crumb.path} 
                      className="font-normal hover:text-indigo-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 p-1 sm:p-1.5 rounded-full pl-2 sm:pl-3 pr-1 sm:pr-2 transition-colors outline-none">
                      <div className="flex-col items-end text-xs sm:text-sm mr-1 hidden sm:flex">
                         <span className="font-semibold text-slate-900 leading-none">{user?.name}</span>
                         <span className="text-[10px] sm:text-xs text-slate-500 capitalize leading-none mt-0.5 sm:mt-1">
                           {user?.role?.toLowerCase().replace('_', ' ')}
                         </span>
                      </div>
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-slate-200 shadow-sm cursor-pointer">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
                        <AvatarFallback className="text-xs sm:text-sm">{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 sm:w-56">
                   <DropdownMenuLabel className="text-xs sm:text-sm">My Account</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                     <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                     <span>Profile</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                     <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                     <span>Settings</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 text-xs sm:text-sm">
                     <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                     <span>Log out</span>
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
