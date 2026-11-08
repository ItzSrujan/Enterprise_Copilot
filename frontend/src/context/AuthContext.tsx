import React, { createContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/api/auth';
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
} from '@/utils/helpers';
import { LoginCredentials, RegisterData, User, UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials, expectedRole?: UserRole) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async (authToken: string) => {
    try {
      const fetchedUser = await authApi.getMe(authToken);
      setUser(fetchedUser);
      setStoredUser(fetchedUser);
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();

    if (existingToken) {
      setToken(existingToken);
      if (existingUser) {
        setUser(existingUser);
        setLoading(false);
        loadCurrentUser(existingToken);
      } else {
        loadCurrentUser(existingToken);
      }
    } else {
      setLoading(false);
    }
  }, [loadCurrentUser]);

  const login = async (
    credentials: LoginCredentials,
    expectedRole?: UserRole
  ): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate with backend
      const response = await authApi.login(credentials);

      // 2. Fetch authenticated profile directly using returned access token
      const fetchedUser = await authApi.getMe(response.access_token);

      // 3. Verify selected frontend role against authoritative backend role if specified
      if (
        expectedRole &&
        fetchedUser.role.toLowerCase() !== expectedRole.toLowerCase()
      ) {
        removeStoredToken();
        setToken(null);
        setUser(null);

        const roleLabels: Record<string, string> = {
          admin: 'Admin',
          employee: 'Employee',
        };
        const actualLabel =
          roleLabels[fetchedUser.role.toLowerCase()] || fetchedUser.role;
        const expectedLabel =
          roleLabels[expectedRole.toLowerCase()] || expectedRole;

        throw new Error(
          `Role mismatch: Your account has the "${actualLabel}" role, but "${expectedLabel}" was selected. Please select "${actualLabel}" to sign in.`
        );
      }

      // 4. Persist verified access token and user state
      setStoredToken(response.access_token);
      setToken(response.access_token);
      setUser(fetchedUser);
      setStoredUser(fetchedUser);

      return fetchedUser;
    } catch (err: any) {
      const msg = err.message || 'Failed to log in. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authApi.register(data);
      return newUser;
    } catch (err: any) {
      const msg = err.message || 'Failed to register account.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) return;
    await loadCurrentUser(currentToken);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

