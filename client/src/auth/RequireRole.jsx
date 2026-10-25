/**
 * client/src/auth/RequireRole.jsx
 *
 * Route guard that checks authentication and required role.
 * Redirects to /login with a flash message if unauthenticated or unauthorized.
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-medium">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: 'Please log in to access this page.', from: location }}
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="flex-1 max-w-lg mx-auto my-16 p-8 bg-white border border-amber-200 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mx-auto mb-3">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          This page requires an authorized <strong className="text-slate-800">{role}</strong> account.
          <br />
          You are currently signed in as <strong className="text-slate-800">{user.name}</strong> ({user.role}).
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {user.role === 'agent' ? (
            <Link
              to="/staff/support"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Go to Support Queue
            </Link>
          ) : (
            <Link
              to="/flights"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Browse Flights
            </Link>
          )}
          <Link
            to="/login"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
