import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export interface RoleNavigateFunction {
    (to: string, options?: { replace?: boolean; state?: any }): void;
    isManager: boolean;
    isAccountant: boolean;
    isEngineer: boolean;
    role?: string;
}

/**
 * A wrapper around React Router's `useNavigate` that automatically
 * prepends the correct role-based base path (e.g., `/manager` or `/accountant`).
 * It also exposes role booleans like `.isManager` to help conditional rendering.
 */
export function useRoleNavigate(): RoleNavigateFunction {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isManager = user?.role === 'MANAGER' || user?.role === 'OWNER';
    const isAccountant = user?.role === 'ACCOUNTANT';
    const isEngineer = user?.role === 'ENGINEER';

    const basePath = isAccountant ? '/accountant' : 
                     isManager ? '/manager' :
                     isEngineer ? '/engineer' : '';

    const navigateRole = ((to: string, options?: { replace?: boolean; state?: any }) => {
        // If the path already has a leading slash, prepend the basePath
        // otherwise, just navigate relative to the current URL.
        const targetPath = to.startsWith('/') ? `${basePath}${to}` : to;
        navigate(targetPath, options);
    }) as RoleNavigateFunction;

    navigateRole.isManager = !!isManager;
    navigateRole.isAccountant = !!isAccountant;
    navigateRole.isEngineer = !!isEngineer;
    navigateRole.role = user?.role;

    return navigateRole;
}
