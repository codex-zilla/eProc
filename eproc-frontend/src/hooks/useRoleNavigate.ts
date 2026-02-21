import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * A wrapper around React Router's `useNavigate` that automatically
 * prepends the correct role-based base path (e.g., `/manager` or `/accountant`).
 */
export function useRoleNavigate() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const basePath = user?.role === 'ACCOUNTANT' ? '/accountant' : 
                     (user?.role === 'MANAGER' || user?.role === 'OWNER') ? '/manager' :
                     user?.role === 'ENGINEER' ? '/engineer' : '';

    const navigateRole = (to: string, options?: { replace?: boolean; state?: any }) => {
        // If the path already has a leading slash, prepend the basePath
        // otherwise, just navigate relative to the current URL.
        const targetPath = to.startsWith('/') ? `${basePath}${to}` : to;
        navigate(targetPath, options);
    };

    return navigateRole;
}
