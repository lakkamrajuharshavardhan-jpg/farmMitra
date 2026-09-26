import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

/* Inline brand mark SVG */
const BrandMark: React.FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="fm-grad-login" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
    </defs>
    <path
      d="M18 3C18 3 6 8.5 6 17.5C6 24.5 11.5 30.5 18 33C24.5 30.5 30 24.5 30 17.5C30 8.5 18 3 18 3Z"
      fill="url(#fm-grad-login)"
    />
    <rect x="17" y="17" width="2" height="8" rx="1" fill="white" />
    <path
      d="M18 20 C14 18 12 14 14 11 C15 13 16 15 18 16"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M18 17 C22 15 25 11 23 8 C21 10 19 12 18 14"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="18" cy="10" r="1.5" fill="white" opacity="0.9" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d16] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fadein-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-500/30 p-2 shadow-2xl shadow-emerald-950 mb-4">
            <BrandMark />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Farm<span className="text-emerald-400">Mitra</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">
            Agronomy Journal &amp; AI Copilot
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-7 sm:p-9 rounded-3xl border border-emerald-900/30 shadow-2xl relative">
          <h2 className="text-xl font-extrabold text-white mb-6">
            Sign In to Account
          </h2>

          {(error || localError) && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@farmmitra.ai"
                  required
                  className="fm-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="fm-input pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Copilot <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have a farmer account yet?{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Register field
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
