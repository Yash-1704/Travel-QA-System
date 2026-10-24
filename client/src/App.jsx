/**
 * client/src/App.jsx
 *
 * Main application shell with routing, role guards, navigation, footer, and chat widget.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import RequireRole from './auth/RequireRole.jsx';

import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import ChatWidget from './components/ChatWidget.jsx';

import Home from './pages/Home.jsx';
import FlightSearch from './pages/FlightSearch.jsx';
import FlightDetails from './pages/FlightDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Book from './pages/Book.jsx';
import MyBookings from './pages/MyBookings.jsx';
import MySupport from './pages/MySupport.jsx';
import SupportQueue from './pages/staff/SupportQueue.jsx';
import LabChat from './pages/LabChat.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
          <NavBar />

          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/flights" element={<FlightSearch />} />
              <Route path="/flights/:id" element={<FlightDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Protected Routes */}
              <Route
                path="/book/:flightId"
                element={
                  <RequireRole role="customer">
                    <Book />
                  </RequireRole>
                }
              />
              <Route
                path="/account/bookings"
                element={
                  <RequireRole role="customer">
                    <MyBookings />
                  </RequireRole>
                }
              />
              <Route
                path="/account/support"
                element={
                  <RequireRole role="customer">
                    <MySupport />
                  </RequireRole>
                }
              />

              {/* Agent Protected Routes */}
              <Route
                path="/staff/support"
                element={
                  <RequireRole role="agent">
                    <SupportQueue />
                  </RequireRole>
                }
              />

              {/* Legacy dashboard redirect */}
              <Route path="/dashboard" element={<Navigate to="/staff/support" replace />} />

              {/* Lab Chat for Researcher Evaluation Bench */}
              <Route
                path="/lab/chat"
                element={
                  <div className="flex-1 flex justify-center bg-slate-100 min-h-[calc(100vh-64px)]">
                    <LabChat />
                  </div>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Floating V2 Chat Widget (omitted on /staff/* and /lab/chat) */}
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
