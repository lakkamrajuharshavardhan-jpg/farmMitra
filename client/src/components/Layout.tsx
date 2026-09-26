import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CopilotDrawer } from './CopilotDrawer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isFieldDetailPage = location.pathname.startsWith('/field');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-32 sm:pb-36">
        <Outlet />
      </main>
      {!isFieldDetailPage && <CopilotDrawer />}
    </div>
  );
};

