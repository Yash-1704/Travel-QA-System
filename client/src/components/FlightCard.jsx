/**
 * client/src/components/FlightCard.jsx
 *
 * Card component displaying flight schedule, duration, aircraft, and fares.
 */

import React from 'react';
import { Link } from 'react-router-dom';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : '00m'}`;
}

export default function FlightCard({ flight }) {
  const minPrice = Math.min(...(flight.fares || []).map(f => f.price));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Route & Times */}
      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Airline Info */}
        <div className="min-w-[140px]">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider mb-1">
            {flight.airline}
          </span>
          <div className="font-bold text-slate-900 text-base">{flight.flightNo}</div>
          <div className="text-xs text-slate-500">{flight.aircraft}</div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-4 flex-1">
          {/* Departure */}
          <div>
            <div className="text-xl font-bold text-slate-900">
              {flight.departureLocal ? flight.departureLocal.slice(-5) : '00:00'}
            </div>
            <div className="text-sm font-semibold text-slate-700">{flight.origin}</div>
            <div className="text-[11px] text-slate-400">{flight.originTz}</div>
          </div>

          {/* Duration Indicator */}
          <div className="flex flex-col items-center px-2 flex-1 max-w-[120px]">
            <span className="text-[11px] font-medium text-slate-500 mb-1">
              {formatDuration(flight.durationMinutes)}
            </span>
            <div className="w-full flex items-center gap-1">
              <div className="h-0.5 bg-slate-200 flex-1"></div>
              <span className="text-slate-400 text-xs">✈</span>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1">Non-stop</span>
          </div>

          {/* Arrival */}
          <div>
            <div className="text-xl font-bold text-slate-900">
              {flight.arrivalLocal ? flight.arrivalLocal.slice(-5) : '00:00'}
            </div>
            <div className="text-sm font-semibold text-slate-700">{flight.destination}</div>
            <div className="text-[11px] text-slate-400">{flight.destinationTz}</div>
          </div>
        </div>
      </div>

      {/* Fares & Booking CTA */}
      <div className="flex items-center md:flex-col lg:flex-row justify-between md:justify-center md:items-end lg:items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
        <div>
          <div className="text-xs text-slate-400">From</div>
          <div className="text-2xl font-bold text-sky-600">${minPrice}</div>
          <div className="text-[10px] text-slate-400">demo price (USD)</div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/flights/${flight.id || flight._id}`}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Details
          </Link>
          <Link
            to={`/book/${flight.id || flight._id}`}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-colors"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
