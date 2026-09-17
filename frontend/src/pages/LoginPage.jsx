import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(userId, password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Network Connection Error: Cannot reach API server. Please check your connection or wait 30s for server cold start.');
      } else {
        setError(err.response?.data?.detail || 'Invalid User ID or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-slate-900 px-8 py-8 text-white text-center">
          <div className="h-12 w-12 bg-white text-slate-900 rounded-xl mx-auto flex items-center justify-center font-black text-2xl mb-3 shadow-md">
            TM
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Task Manager</h1>
          <p className="text-slate-300 text-xs mt-1 font-medium tracking-wide uppercase">Enterprise Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              User ID *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

      </div>
    </div>
  );
}
