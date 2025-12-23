import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/axios';

interface User {
  email: string;
  role: string;
  name: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setIsLoading(false);
  }, [token]);

  const handleAuthResponse = (response: any) => {
    const { token: newToken, email: userEmail, role, name } = response.data;
    
    // Store token and user info
    localStorage.setItem('token', newToken);
    const userData: User = { email: userEmail, role, name };
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(newToken);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    error,
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
