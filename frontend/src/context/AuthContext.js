import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, signup as signupAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from memory (no localStorage in sandboxed envs)
    const storedUser = window.__authUser;
    const storedToken = window.__authToken;
    if (storedUser && storedToken) setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginAPI({ email, password });
    window.__authToken = data.token;
    window.__authUser = data.user;
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await signupAPI({ name, email, password });
    window.__authToken = data.token;
    window.__authUser = data.user;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    window.__authToken = null;
    window.__authUser = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
