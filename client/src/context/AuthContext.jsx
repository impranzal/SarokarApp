import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expireSession = () => {
      localStorage.removeItem('sarokar_token');
      setUser(null);
    };
    window.addEventListener('sarokar:session-expired', expireSession);
    const token = localStorage.getItem('sarokar_token');
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('sarokar:session-expired', expireSession);
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('sarokar_token'))
      .finally(() => setLoading(false));
    return () => window.removeEventListener('sarokar:session-expired', expireSession);
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('sarokar_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('sarokar_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('sarokar_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
