// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const RequireAuth: React.FC = () => {
  const { user, loading } = useUser();
  const loc = useLocation();
  if (loading) return <p>Loading…</p>;
  if (!user)   return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
};

export const RequireAdmin: React.FC = () => {
  const { user, loading } = useUser();
  const loc = useLocation();
  if (loading)               return <p>Loading…</p>;
  if (!user)                 return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.role !== 'Admin') return <Navigate to="/" replace />;
  return <Outlet />;
};
