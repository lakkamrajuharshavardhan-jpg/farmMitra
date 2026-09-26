import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Sprout className="w-8 h-8 absolute text-emerald-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide text-slate-400">Loading FarmMitra AI Copilot...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
