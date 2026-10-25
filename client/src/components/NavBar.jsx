/**
 * client/src/components/NavBar.jsx
 *
 * Role-aware global navigation bar.
 * Guest: Flights, Login, Register, Lab Chat
 * Customer: Flights, My Bookings, My Support, Logout, Lab Chat
 * Agent: Support Queue, Logout, Lab Chat
 */

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { AGENCY_NAME } from '../config.js';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            ✈
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100 group-hover:text-sky-400 transition-colors">
            {AGENCY_NAME}
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Public / Common links */}
          <NavLink
            to="/flights"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'text-sky-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            Find Flights
          </NavLink>

          {/* Customer links */}
          {user && user.role === 'customer' && (
            <>
              <NavLink
                to="/account/bookings"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-sky-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                My Bookings
              </NavLink>
              <NavLink
                to="/account/support"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-sky-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                My Support
              </NavLink>
            </>
          )}

          {/* Agent links */}
          {user && user.role === 'agent' && (
            <NavLink
              to="/staff/support"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-sky-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Support Queue
            </NavLink>
          )}

          {/* Lab chat link for researchers / demos */}
          <NavLink
            to="/lab/chat"
            className={({ isActive }) =>
              `px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wide border transition-all ${
                isActive
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`
            }
            title="Researcher comparison test bench"
          >
            Lab Chat
          </NavLink>

          <div className="h-5 w-px bg-slate-800 mx-1 sm:mx-2" />

          {/* Auth state links */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-sky-400 font-mono capitalize">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
