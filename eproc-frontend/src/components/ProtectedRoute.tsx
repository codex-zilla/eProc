import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Protected route component that redirects to login if not authenticated.
 * Optionally checks for allowed roles.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
  }

  return <Outlet />;
};

/**
 * Get the default route for a user role.
 */
export function getRoleDefaultRoute(role: string): string {
  switch (role) {
    case 'ENGINEER':
      return '/engineer/dashboard';
    case 'OWNER':
      return '/manager/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    case 'ACCOUNTANT':
      return '/accountant/procurement';
    default:
      return '/engineer/dashboard';
  }
}

export default ProtectedRoute;
