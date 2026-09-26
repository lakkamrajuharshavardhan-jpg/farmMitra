import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { apiFetch, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch<{ user: User }>('/auth/me');
        setUser(res.user);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        removeAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
