import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, fullName) => {
    const { data } = await api.post('/auth/register', { username, email, password, fullName });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setUser(null);
  };

  const updateUser = (updatedData) => setUser((prev) => ({ ...prev, ...updatedData }));

  const resendVerification = async () => {
    await api.post('/auth/resend-verification');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, loadUser, resendVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
