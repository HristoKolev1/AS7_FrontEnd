import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginService, setAuthToken } from '../data/fetchUserWithAuth';
import type { JWTPayload } from '../types';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  user: JWTPayload | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore any token & decode it
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setAuthToken(token);
      try {
        const payload = jwtDecode<JWTPayload>(token);
        setUser(payload);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const payload = await loginService(username, password);
      setUser(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
