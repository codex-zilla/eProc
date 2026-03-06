import { Outlet, Link, useLocation } from 'react-router-dom';
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
  X,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  CheckSquare
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
  children?: SidebarItem[];
}

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/accountant/procurement']); // Default expand for demo

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
    if (user?.role === 'OWNER') {
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

  const handleLogout = async () => {
    await logout();
  };

  const getNavItems = (): SidebarItem[] => {
    if (user?.role === 'ENGINEER') {
      return [
        { label: 'Dashboard', path: '/engineer/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/engineer/project', icon: Building },
        { label: 'Requests', path: '/engineer/requests', icon: ClipboardList },
        { label: 'Deliveries', path: '/engineer/deliveries', icon: Package },
      ];
    }
    if (user?.role === 'OWNER' || user?.role === 'MANAGER') {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/manager/projects', icon: Briefcase },
        { label: 'Project Users', path: '/manager/users', icon: Users },
        { label: 'Requests', path: '/manager/requests', icon: ClipboardList, badge: pendingCount },
        { label: 'Procurement', path: '/manager/procurement', icon: ShoppingCart },
        { label: 'Deliveries', path: '/manager/deliveries', icon: Package },
      ];
    }
    if (user?.role === 'ACCOUNTANT') {
      return [
        { label: 'Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard },
        {
          label: 'Procurement',
          path: '/accountant/procurement',
          icon: ShoppingCart,
          children: [
            { label: 'Approved Requests', path: '/accountant/procurement/approved-requests', icon: CheckSquare },
            { label: 'Purchase Orders', path: '/accountant/procurement/purchase-orders', icon: FileText },
          ]
        },
        { label: 'Deliveries', path: '/accountant/deliveries', icon: Package },
        { label: 'Reports', path: '/accountant/reports', icon: BarChart3 },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Breadcrumb Logic
  const breadcrumbs: { label: string; path?: string; active?: boolean }[] = [];

  // Special handling for manager request details (doesn't match /manager/requests path)
  if (/^\/manager\/requests\/\d+$/.test(location.pathname)) {
    breadcrumbs.push({
      label: 'Requests',
      path: '/manager/requests',
      active: false
    });
    breadcrumbs.push({
      label: 'Details',
      active: true
    });
  } else {
    // Find key root section - handles nested items check
    let activeNavItem = navItems.find(i => location.pathname.startsWith(i.path));

    // Check children if not found or to find specific child
    let activeChildItem: SidebarItem | undefined;
    if (activeNavItem?.children) {
      activeChildItem = activeNavItem.children.find(c => location.pathname.startsWith(c.path));
    }

    if (activeNavItem) {
      // Level 1: Sidebar Item
      breadcrumbs.push({
        label: activeNavItem.label,
        path: activeNavItem.children ? undefined : activeNavItem.path, // Don't link if it's a parent with children (accordion)
        active: location.pathname === activeNavItem.path
      });

      // Level 1.5: Child Sidebar Item
      if (activeChildItem) {
        breadcrumbs.push({
          label: activeChildItem.label,
          path: activeChildItem.path,
          active: location.pathname === activeChildItem.path
        });
      }

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

      // Accountant Details
      if (/^\/accountant\/procurement\/purchase-orders\/\d+$/.test(location.pathname)) {
        if (breadcrumbs.length > 1) breadcrumbs[1].active = false; // Make PO list inactive
        breadcrumbs.push({
          label: 'PO Details',
          active: true
        })
      }

      // Engineer Routes Logic
      if (location.pathname === '/engineer/create-batch') {
        breadcrumbs[0].active = false;
        breadcrumbs.push({
          label: 'Create New Request',
          active: true
        });
      } else if (/^\/engineer\/batches\/\d+$/.test(location.pathname)) {
        breadcrumbs[0].active = false;
        breadcrumbs.push({
          label: 'Request Details',
          active: true
        });
      } else if (location.pathname === '/engineer/create-batch') {
        breadcrumbs[0].active = false;
        breadcrumbs.push({
          label: 'Create New Request',
          active: true
        });
      } else if (/^\/engineer\/requests\/\d+$/.test(location.pathname)) {
        breadcrumbs[0].active = false;
        breadcrumbs.push({
          label: 'Request Details',
          active: true
        });
      } else if (/^\/engineer\/requests\/\d+\/edit$/.test(location.pathname)) {
        breadcrumbs[0].active = false;
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
  }

  // Sidebar content component (reused for both desktop and mobile)
  const SidebarContent = ({ showCloseButton = false }: { showCloseButton?: boolean }) => (
    <>
      <div className={cn(
        "flex items-center gap-3 relative transition-all h-14 sm:h-16",
        isSidebarCollapsed && !isMobileMenuOpen ? "px-3 justify-center" : "px-3"
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

      <div className="flex-1 py-4 px-2 sm:px-3 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const isExpanded = expandedMenus.includes(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const Icon = item.icon;

            const handleExpand = (e: React.MouseEvent) => {
              if (hasChildren) {
                e.preventDefault();
                setExpandedMenus(prev =>
                  prev.includes(item.path)
                    ? prev.filter(p => p !== item.path)
                    : [...prev, item.path]
                );
              }
            };

            return (
              <div key={item.path} className="mb-1">
                <Link
                  to={hasChildren ? '#' : item.path}
                  onClick={handleExpand}
                  title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group relative select-none",
                    isActive && !hasChildren
                      ? "bg-[#2a3455] text-white hover:bg-[#1e253e]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    isSidebarCollapsed && !isMobileMenuOpen && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && !hasChildren ? "text-slate-white" : "text-slate-400 group-hover:text-slate-600")} />

                  {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-between">
                      {item.label}
                      {hasChildren && (
                        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", isExpanded ? "-rotate-90" : "rotate-0")} />
                      )}
                    </span>
                  )}

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <div className={cn(
                      "flex items-center justify-center bg-red-500 text-white rounded-full  font-bold shadow-sm",
                      isSidebarCollapsed && !isMobileMenuOpen
                        ? "absolute top-1 right-1 h-2.5 w-2.5 p-0"
                        : "ml-auto px-1.5 py-0.5 h-5 min-w-[1.25rem] text-[10px]"
                    )}>
                      {(!isSidebarCollapsed || isMobileMenuOpen) && item.badge}
                    </div>
                  )}
                </Link>

                {/* Children Submenu */}
                {hasChildren && isExpanded && (!isSidebarCollapsed || isMobileMenuOpen) && (
                  <div className="ml-9 mt-1 space-y-1 relative before:absolute before:left-[-1.1rem] before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
                    {item.children!.map(child => {
                      const isChildActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 group relative",
                            isChildActive
                              ? "text-indigo-600 font-medium bg-indigo-50"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {/* <ChildIcon className="h-4 w-4" /> */}
                          <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-3 sm:p-4 px-2 sm:px-3 mt-auto">
        {(!isSidebarCollapsed || isMobileMenuOpen) ? (
          <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-100">
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
          "fixed inset-y-0 left-0 z-50 w-50 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent showCloseButton={true} />
      </aside>

      {/* Desktop/Tablet Sidebar */}
      <aside
        className={cn(
          "bg-white border-r flex-col fixed inset-y-0 z-50 shadow-sm transition-all duration-300 ease-in-out hidden md:flex",
          isSidebarCollapsed ? "w-20" : "w-50"
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
          !isSidebarCollapsed && "lg:ml-50"
        )}
      >
        <header className="bg-white sticky top-0 z-40 border-b h-14 sm:h-16 flex items-center px-3 sm:px-5 shadow-sm justify-between">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-1 mr-2 text-slate-700 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors focus:outline-none"
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
        <main className="flex-1 p-3 sm:p-4 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
