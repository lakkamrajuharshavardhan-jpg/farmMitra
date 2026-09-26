import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Sprout, FlaskConical, HelpCircle, LayoutDashboard, Camera } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/* ── Cropin Style Leaf Brand Mark SVG ── */
const CropinBrandMark: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    </div>
    <div className="leading-none">
      <span className="text-2xl font-black tracking-tight text-slate-900">
        Farm<span className="text-emerald-600">Mitra</span>
      </span>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mt-0.5">
        Cropin Agronomy Engine
      </span>
    </div>
  </div>
);

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Derive avatar initials */
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FM';

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo ── */}
        <Link to="/" className="flex items-center group shrink-0" aria-label="FarmMitra Home">
          <CropinBrandMark />
        </Link>

        {/* ── Main Navigation Tabs ── */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-500" /> Dashboard
          </Link>

          <Link
            to="/leaf-doctor"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/leaf-doctor')
                ? 'bg-teal-600 text-white shadow-sm font-black'
                : 'hover:bg-teal-50 text-teal-800'
            }`}
          >
            <Camera className="w-4 h-4 text-teal-500" /> AI Leaf Doctor
          </Link>

          <Link
            to="/crop-knowledge"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/crop-knowledge')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-500" /> Crop Knowledge Grid
          </Link>

          <Link
            to="/fertilizer-knowledge"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/fertilizer-knowledge')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-500" /> Fertilizer Grid
          </Link>

          <Link
            to="/how-to-use"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/how-to-use')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-cyan-500" /> How to Use
          </Link>
        </nav>

        {/* ── Right Actions: User Profile Avatar + Logout ── */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[11px] font-black">
                {initials}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.name}</span>
            </div>
          )}

          {user && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2.5 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-xl animate-fadein-up">
          <nav className="flex flex-col space-y-2 font-bold text-sm text-slate-800">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-3 ${
                isActive('/') ? 'bg-slate-900 text-white font-extrabold' : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-500" /> Dashboard
            </Link>

            <Link 
              to="/leaf-doctor" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-3 ${
                isActive('/leaf-doctor') ? 'bg-teal-600 text-white font-extrabold' : 'hover:bg-teal-50 text-teal-800'
              }`}
            >
              <Camera className="w-5 h-5 text-teal-500" /> AI Leaf Doctor
            </Link>

            <Link 
              to="/crop-knowledge" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-3 ${
                isActive('/crop-knowledge') ? 'bg-slate-900 text-white font-extrabold' : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Sprout className="w-5 h-5 text-emerald-500" /> Crop Knowledge Grid
            </Link>

            <Link 
              to="/fertilizer-knowledge" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-3 ${
                isActive('/fertilizer-knowledge') ? 'bg-slate-900 text-white font-extrabold' : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <FlaskConical className="w-5 h-5 text-amber-500" /> Fertilizer Grid
            </Link>

            <Link 
              to="/how-to-use" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl flex items-center gap-3 ${
                isActive('/how-to-use') ? 'bg-slate-900 text-white font-extrabold' : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <HelpCircle className="w-5 h-5 text-cyan-500" /> How to Use
            </Link>
          </nav>

          {user && (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
