"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; username: string; name: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.setToken(token);
    const response = await authApi.me();

    if (response.data?.user) {
      setUser(response.data.user);
    } else {
      localStorage.removeItem('auth_token');
      api.setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: 'Login failed' };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const register = async (data: { email: string; password: string; username: string; name: string }) => {
    const response = await authApi.register(data);

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: 'Registration failed' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
