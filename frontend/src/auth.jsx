import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ecodrop_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ecodrop_token');
    if (!token) { setLoading(false); return; }
    api.me().then(({ user }) => {
      setUser(user);
      localStorage.setItem('ecodrop_user', JSON.stringify(user));
    }).catch(() => {
      localStorage.removeItem('ecodrop_token');
      localStorage.removeItem('ecodrop_user');
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const persist = ({ token, user }) => {
    localStorage.setItem('ecodrop_token', token);
    localStorage.setItem('ecodrop_user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, senha) => persist(await api.login(email, senha));
  const register = async (email, senha) => persist(await api.register(email, senha));
  const logout = () => {
    localStorage.removeItem('ecodrop_token');
    localStorage.removeItem('ecodrop_user');
    setUser(null);
  };
  const updateRecord = (record) => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, record };
      localStorage.setItem('ecodrop_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, updateRecord }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);