"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean; email?: string }>;
  logout: () => Promise<void>;
  register: (
    data: { email: string; password: string; username: string; name: string }
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean; email?: string }>;
  verifyEmail: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      api.setToken(token);
      const response = await authApi.me();

      if (response.data?.user?.isEmailVerified) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('auth_token');
        api.setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('auth_token');
      api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    if (response.error) {
      if (response.error.code === 'EMAIL_NOT_VERIFIED') {
        return {
          success: false,
          error: response.error.message,
          requiresEmailVerification: true,
          email,
        };
      }
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

    if (response.data?.requiresEmailVerification) {
      return {
        success: true,
        requiresEmailVerification: true,
        email: response.data.email,
      };
    }

    return { success: false, error: 'Registration failed' };
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await authApi.verifyEmail({ email, code });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: 'Email verification failed' };
  };

  const resendVerificationCode = async (email: string) => {
    const response = await authApi.resendVerificationCode(email);
    if (response.error) {
      return { success: false, error: response.error.message };
    }
    return { success: true };
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
        verifyEmail,
        resendVerificationCode,
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
