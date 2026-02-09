import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/axios';

interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  requirePasswordChange?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  erbNumber?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user, clear it
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = (response: any) => {
    // Token is handled via HttpOnly cookie, we just need user info
    const { email: userEmail, role, name, id, requirePasswordChange } = response.data;

    // Store user info
    const userData: User = { id, email: userEmail, role, name, requirePasswordChange };
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
  };

  const handleError = (err: any) => {
    let message = 'An unexpected error occurred';
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      message = err.response.data?.message || 'Authentication failed';
    } else if (err.request) {
      // The request was made but no response was received
      message = 'Unable to connect to server. Please check your internet connection or try again later.';
    } else {
      // Something happened in setting up the request that triggered an Error
      message = err.message;
    }
    setError(message);
    throw new Error(message);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      handleAuthResponse(response);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', data);
      handleAuthResponse(response);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Cleanup old token if exists
      setUser(null);
      setError(null);
      window.location.href = '/login';
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setError(null);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      // Update user to clear requirePasswordChange flag
      if (user) {
        const updatedUser = { ...user, requirePasswordChange: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      handleError(err);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
