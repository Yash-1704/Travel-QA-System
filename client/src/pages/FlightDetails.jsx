/**
 * client/src/pages/FlightDetails.jsx
 *
 * Detailed flight view showing schedule in both airport local times, aircraft info, and fare classes.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : '00m'}`;
}

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFlight() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/flights/${id}`);
        if (!res.ok) {
          throw new Error('Flight not found or invalid flight ID');
        }
        const data = await res.json();
        setFlight(data.flight);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFlight();
  }, [id]);

  const handleBookClick = fareClass => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please log in as a customer to proceed with booking.',
          from: { pathname: `/book/${id}` }
        }
      });
    } else {
      navigate(`/book/${id}?fareClass=${encodeURIComponent(fareClass)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
        <span className="text-3xl block mb-2">⚠️</span>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Flight Unavailable</h2>
        <p className="text-sm text-slate-500 mb-4">{error || 'Could not load flight details.'}</p>
        <Link to="/flights" className="text-sky-600 font-semibold text-sm hover:underline">
          Back to all flights
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link to="/flights" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <span>←</span>
          <span>Back to Flights</span>
        </Link>

        {/* Flight Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 mb-2 uppercase">
                {flight.airline}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {flight.flightNo} • {flight.route}
              </h1>
              <p className="text-xs text-slate-500 mt-1">Aircraft: {flight.aircraft}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Duration</span>
              <div className="text-xl font-bold text-slate-800">{formatDuration(flight.durationMinutes)}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Non-stop Service</span>
            </div>
          </div>

          {/* Times & Airports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            {/* Departure */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Departure</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {flight.departureLocal ? flight.departureLocal.slice(-5) : '00:00'}
              </div>
              <div className="text-base font-bold text-slate-800 mt-1">
                Airport: {flight.origin}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Local Timezone: {flight.originTz}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Date: {flight.departureLocal ? flight.departureLocal.slice(0, 10) : ''}
              </div>
            </div>

            {/* Arrival */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Arrival</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {flight.arrivalLocal ? flight.arrivalLocal.slice(-5) : '00:00'}
              </div>
              <div className="text-base font-bold text-slate-800 mt-1">
                Airport: {flight.destination}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Local Timezone: {flight.destinationTz}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Date: {flight.arrivalLocal ? flight.arrivalLocal.slice(0, 10) : ''}
              </div>
            </div>
          </div>

          {/* Fares Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Available Cabin & Fare Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flight.fares?.map((fare, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-5 hover:border-sky-500 transition-colors flex flex-col justify-between bg-white shadow-xs"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">{fare.fareClass}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          fare.seatsAvailable > 5
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {fare.seatsAvailable} seats left
                      </span>
                    </div>
                    <div className="text-2xl font-black text-sky-600 mt-2">
                      ${fare.price}
                      <span className="text-xs text-slate-400 font-normal ml-1">demo price (USD)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClick(fare.fareClass)}
                    disabled={fare.seatsAvailable === 0}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm shadow-sm transition-colors text-center"
                  >
                    {user ? 'Book This Fare' : 'Log In to Book'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
