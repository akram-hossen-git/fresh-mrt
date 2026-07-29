'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/types';
import {
  login as apiLogin,
  signup as apiSignup,
  getUser as apiGetUser,
  logout as apiLogout,
} from '@/lib/api/auth';

const TOKEN_KEY = 'auth_token';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    emailOrPhone: string,
    password: string,
    registerBy?: 'email' | 'phone'
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate existing token
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiGetUser();
      if (response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin({
      email,
      password,
      login_by: 'email',
    });

    if (response.result) {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      setUser(response.user);
    } else {
      throw new Error(response.message);
    }
  }, []);

  const signup = useCallback(
    async (
      name: string,
      emailOrPhone: string,
      password: string,
      registerBy: 'email' | 'phone' = 'email'
    ) => {
      const response = await apiSignup({
        name,
        email_or_phone: emailOrPhone,
        password,
        password_confirmation: password,
        register_by: registerBy,
      });

      if (response.result) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        setUser(response.user);
      } else {
        throw new Error(response.message);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Proceed with client-side logout regardless of API failure
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
