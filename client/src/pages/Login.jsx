import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">CampusHub</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to access your student community feed & AI lab</p>
        </div>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Quick 1-Click Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('alex.morgan@campus.edu')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-indigo-900/40 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors font-medium truncate"
            >
              Alex (Student)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('sarah.chen@campus.edu')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-indigo-900/40 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors font-medium truncate"
            >
              Sarah (ML)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@campushub.edu')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-amber-900/40 text-amber-300 hover:text-white rounded-lg border border-slate-800 transition-colors font-medium truncate"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
