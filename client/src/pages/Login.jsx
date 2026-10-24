/**
 * client/src/pages/Login.jsx
 *
 * User login page with Customer and Staff tabs and demo quick-fill credentials.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState('customer'); // 'customer' or 'agent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.message || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      // Determine destination strictly by user role
      let destination = '/flights';
      if (result.user.role === 'agent') {
        const fromPath = location.state?.from?.pathname;
        destination = (fromPath && fromPath.startsWith('/staff')) ? fromPath : '/staff/support';
      } else {
        const fromPath = location.state?.from?.pathname;
        destination = (fromPath && !fromPath.startsWith('/staff')) ? fromPath : '/flights';
      }
      navigate(destination, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleQuickFill = (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword('jzEVjxfiZ7TAFFaG');
    setTab(role);
    setError(null);
  };

  return (
    <div className="flex-1 bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md shadow-sky-500/20">
            ✈
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {tab === 'customer' ? 'Customer Account Login' : 'Agency Staff Portal Login'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'customer'
              ? 'Log in to book flights, view reservations, and track escalated questions.'
              : 'Log in to review and resolve customer escalation cases in the support queue.'}
          </p>
        </div>

        {/* Active Session Notice */}
        {user && (
          <div className="mb-6 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex flex-col gap-2">
            <div>
              You are signed in as <strong className="font-bold text-sky-900">{user.name}</strong> ({user.role}).
            </div>
            <div className="flex gap-2">
              {user.role === 'agent' ? (
                <Link
                  to="/staff/support"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow-xs"
                >
                  Open Support Queue →
                </Link>
              ) : (
                <Link
                  to="/flights"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow-xs"
                >
                  Find Flights →
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setError(null);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Role Tabs (Visual wording change; role is verified server-side) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('customer');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              tab === 'customer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('agent');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              tab === 'agent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Agency Staff
          </button>
        </div>

        {/* Flash / Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : `Log In as ${tab === 'customer' ? 'Customer' : 'Staff'}`}
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Demo Test Accounts
          </span>
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('arjun.sharma@email.com', 'customer')}
              className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left flex items-center justify-between"
            >
              <span>Arjun Sharma (Customer)</span>
              <span className="text-[10px] text-sky-600 font-mono">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('agent1@travelqa.demo', 'agent')}
              className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left flex items-center justify-between"
            >
              <span>Agent One (Staff Support)</span>
              <span className="text-[10px] text-sky-600 font-mono">Fill</span>
            </button>
          </div>
        </div>

        {/* Sign up prompt */}
        {tab === 'customer' && (
          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have a customer account?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:underline">
              Sign up here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
