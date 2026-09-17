import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Clock, 
  Eye, 
  EyeOff,
  Layers,
  HelpCircle,
  X,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(userId, password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Network Connection Error: Cannot reach API server. Please check your connection.');
      } else {
        setError(err.response?.data?.detail || 'Invalid User ID or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-slate-900 selection:text-white">
      
      {/* LIGHT CANVAS WITH BLACK/SLATE SHADED ORBITAL GRAPHICS BACKGROUND */}
      
      {/* Left Side Outer Graphics */}
      <div className="absolute top-0 left-0 w-1/2 h-full pointer-events-none overflow-hidden z-0">
        {/* Soft Black/Slate Shaded Circle (Top Left) */}
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-slate-900/5 border border-slate-900/10"></div>
        {/* Soft Black/Slate Shaded Circle (Bottom Left) */}
        <div className="absolute -bottom-20 -left-32 w-[620px] h-[620px] rounded-full bg-slate-900/10 border border-slate-900/15"></div>

        {/* Concentric Orbital Arc Rings & Black Accent Node Dot */}
        <svg className="absolute -bottom-24 -left-24 w-[650px] h-[650px]" viewBox="0 0 650 650" fill="none">
          <circle cx="200" cy="450" r="320" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.25" />
          <circle cx="200" cy="450" r="250" stroke="#0f172a" strokeWidth="1.5" opacity="0.3" />
          <circle cx="200" cy="450" r="180" stroke="#0f172a" strokeWidth="1.2" opacity="0.2" />
          {/* Black Accent Node Dot */}
          <circle cx="376" cy="290" r="7.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Right Side Outer Graphics */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden z-0">
        {/* Soft Black/Slate Shaded Circle (Top Right) */}
        <div className="absolute -top-32 -right-32 w-[580px] h-[580px] rounded-full bg-slate-900/5 border border-slate-900/10"></div>
        {/* Soft Black/Slate Shaded Circle (Bottom Right) */}
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-slate-900/10 border border-slate-900/15"></div>

        {/* Concentric Orbital Arc Rings & Black Accent Node Dot */}
        <svg className="absolute -top-24 -right-24 w-[650px] h-[650px]" viewBox="0 0 650 650" fill="none">
          <circle cx="450" cy="200" r="340" stroke="#0f172a" strokeWidth="1.5" opacity="0.3" />
          <circle cx="450" cy="200" r="260" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.25" />
          <circle cx="450" cy="200" r="190" stroke="#0f172a" strokeWidth="1.2" opacity="0.2" />
          {/* Black Accent Node Dot */}
          <circle cx="266" cy="330" r="7.5" fill="#0f172a" />
        </svg>
      </div>

      {/* Subtle Dot Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-25 pointer-events-none z-0"></div>

      {/* CENTERED CARD CONTAINER (max-w-5xl Size) */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10">
        
        {/* LEFT SIDE: Hero Panel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-slate-800/60 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-11 w-11 bg-white text-slate-900 rounded-xl flex items-center justify-center font-black text-xl shadow-md">
              TM
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight block text-white leading-none">Task Manager</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Enterprise Portal</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 my-auto py-8 space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5 text-white" /> Workspace Operations
              </span>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Manage tasks & track team progress.
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                A centralized workspace designed to keep your team organized, productive, and aligned on every goal.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700 shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span>End-to-End Task Lifecycle Workflows</span>
              </div>

              <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700 shadow-xs">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span>Team Workload & Capacity Management</span>
              </div>

              <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700 shadow-xs">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span>Time Tracking & Performance Analytics</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-400 font-medium">
            Task Manager Workspace Platform • Secure Authentication
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form (6 cols) */}
        <div className="lg:col-span-6 bg-white p-8 lg:p-12 flex flex-col justify-between">
          
          <div className="my-auto max-w-md w-full mx-auto space-y-7">
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Sign In
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium">
                Welcome back! Please enter your credentials to access your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  User ID <span className="text-slate-900">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password <span className="text-slate-900">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer transition-all flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Need help logging in?</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            Task Manager System • All Rights Reserved
          </div>
        </div>

      </div>

      {/* LOGIN ASSISTANCE MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-900 border border-slate-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">Login Assistance</h3>
                  <p className="text-xs text-slate-500 font-medium">Account access & credentials recovery</p>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-slate-800" /> Reset Password / Forgot User ID?
                </span>
                <p className="text-slate-600 leading-normal">
                  Password resets and account recovery are managed by your System Administrator. Please contact your workspace admin or manager to reset your password or verify your assigned User ID.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
