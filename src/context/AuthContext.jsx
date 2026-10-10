import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi, STORAGE_KEY } from '../api/client.js';

const AuthContext = createContext(null);

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export const HOME_BY_ROLE = {
  JOB_SEEKER: '/seeker',
  EMPLOYER: '/employer',
  ADMIN: '/admin',
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStored);

  const persist = useCallback((data) => {
    const value = { token: data.token, user: data.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setSession(value);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => persist(await authApi.login({ email, password })), [persist]);
  const register = useCallback(async (payload) => persist(await authApi.register(payload)), [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
    }),
    [session, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
