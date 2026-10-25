/**
 * client/src/pages/MyBookings.jsx
 *
 * Displays the logged-in customer's own bookings fetched from GET /api/bookings/mine.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(location.state?.message || null);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/bookings/mine');
        if (!res.ok) {
          throw new Error('Failed to load reservations.');
        }
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Flight Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View your upcoming reservations and travel history.
          </p>
        </div>

        {flashMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex justify-between items-center">
            <span>✓ {flashMessage}</span>
            <button
              onClick={() => setFlashMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
            <span className="text-sm">Retrieving your bookings...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl mb-3 block">🎫</span>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Bookings Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              You haven't booked any flights yet. Browse our routes to make your first reservation.
            </p>
            <Link
              to="/flights"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Find Flights
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b._id || b.bookingId}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {b.bookingId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Source: {b.source || 'website'}
                    </span>
                  </div>

                  <div className="text-base font-bold text-slate-900">
                    {b.flightNo} • {b.route} ({b.airline})
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Departure Date: <span className="font-semibold text-slate-700">{b.date}</span> • Cabin: <span className="font-semibold text-slate-700">{b.fareClass}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400">Passengers: {b.passengers || 1}</div>
                    <div className="text-lg font-bold text-slate-900">
                      {b.totalPrice ? `$${b.totalPrice} USD` : 'Complimentary / Seed'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('tq-open-chat-booking', {
                          detail: {
                            bookingId: b.bookingId,
                            flightNo: b.flightNo,
                            route: b.route,
                            airline: b.airline
                          }
                        })
                      );
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-500 hover:underline cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Ask about this booking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
