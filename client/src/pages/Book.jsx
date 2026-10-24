/**
 * client/src/pages/Book.jsx
 *
 * Booking review and confirmation page for customers.
 * Handles fare selection, passenger count (1-4), server-side price calculation, and 409 overbooking states.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : '00m'}`;
}

export default function Book() {
  const { flightId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [fareClass, setFareClass] = useState(searchParams.get('fareClass') || '');
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFlight() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/flights/${flightId}`);
        if (!res.ok) {
          throw new Error('Flight not found or invalid flight ID');
        }
        const data = await res.json();
        setFlight(data.flight);
        if (!fareClass && data.flight.fares?.length > 0) {
          setFareClass(data.flight.fares[0].fareClass);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFlight();
  }, [flightId]);

  const selectedFare = flight?.fares?.find(f => f.fareClass === fareClass) || flight?.fares?.[0];
  const totalPrice = selectedFare ? selectedFare.price * passengers : 0;

  const handleConfirm = async e => {
    e.preventDefault();
    if (!selectedFare) {
      setError('Please choose a valid fare class.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId,
          fareClass: selectedFare.fareClass,
          passengers
        })
      });

      const data = await res.json();

      if (res.status === 201) {
        // Success
        navigate('/account/bookings', {
          state: { message: `Booking confirmed! Reference: ${data.booking.bookingId}` }
        });
      } else if (res.status === 409) {
        setError('Sorry, there are not enough seats left in this fare class for your requested passenger count.');
      } else {
        setError(data.error || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setError('Network error while processing booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Error</h2>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <Link to="/flights" className="text-sky-600 font-semibold text-sm hover:underline">
          Return to flights
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to={`/flights/${flightId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <span>←</span>
          <span>Back to Flight Details</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Review & Confirm</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Book Flight {flight.flightNo}
            </h1>
            <p className="text-xs text-slate-500">{flight.airline} • {flight.route}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs leading-relaxed">
              <span className="font-bold">Booking alert: </span>{error}
            </div>
          )}

          {/* Flight Summary Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
              <span>{flight.origin} ➔ {flight.destination}</span>
              <span className="text-xs text-slate-500">{formatDuration(flight.durationMinutes)} non-stop</span>
            </div>
            <div className="grid grid-cols-2 text-xs text-slate-600 gap-2 border-t border-slate-200 pt-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Departure</span>
                <span className="font-bold text-slate-800">{flight.departureLocal}</span>
                <span className="text-[10px] text-slate-400 block">{flight.originTz}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Arrival</span>
                <span className="font-bold text-slate-800">{flight.arrivalLocal}</span>
                <span className="text-[10px] text-slate-400 block">{flight.destinationTz}</span>
              </div>
            </div>
          </div>

          {/* Booking Options Form */}
          <form onSubmit={handleConfirm} className="space-y-6">
            {/* Fare Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Fare Class
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {flight.fares?.map((f, idx) => (
                  <label
                    key={idx}
                    className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between transition-all ${
                      fareClass === f.fareClass
                        ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="fareClass"
                          value={f.fareClass}
                          checked={fareClass === f.fareClass}
                          onChange={() => setFareClass(f.fareClass)}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm font-bold text-slate-900">{f.fareClass}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">${f.price}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 block pl-5">
                      {f.seatsAvailable} seats available
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Passenger Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Number of Passengers (Max 4)
              </label>
              <select
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
              >
                <option value={1}>1 Passenger</option>
                <option value={2}>2 Passengers</option>
                <option value={3}>3 Passengers</option>
                <option value={4}>4 Passengers</option>
              </select>
            </div>

            {/* Total Price & Simulated Payment Note */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-800 font-semibold block">Total Demo Amount</span>
                  <span className="text-[11px] text-sky-600">No payment is taken (demo)</span>
                </div>
                <div className="text-3xl font-black text-sky-700">
                  ${totalPrice}
                  <span className="text-xs font-normal text-sky-600 ml-1">USD</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || (selectedFare && selectedFare.seatsAvailable < passengers)}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm shadow-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Confirming Reservation...' : 'Confirm Demo Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
