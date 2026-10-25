/**
 * client/src/pages/Home.jsx
 *
 * Landing page: flight search form, popular routes, airlines, and demo data disclaimer.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGENCY_NAME, DEMO_DATA_NOTICE } from '../config.js';

const POPULAR_ROUTES = [
  { origin: 'DEL', destination: 'DXB', label: 'Delhi to Dubai', airline: 'SkyNova Air' },
  { origin: 'BOM', destination: 'LHR', label: 'Mumbai to London', airline: 'ArcticJet' },
  { origin: 'DEL', destination: 'BKK', label: 'Delhi to Bangkok', airline: 'SkyNova Air' },
  { origin: 'BOM', destination: 'SIN', label: 'Mumbai to Singapore', airline: 'ArcticJet' },
  { origin: 'DEL', destination: 'NRT', label: 'Delhi to Tokyo', airline: 'VistaAir' },
  { origin: 'BOM', destination: 'JFK', label: 'Mumbai to New York', airline: 'VistaAir' }
];

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from.trim()) params.set('from', from.trim().toUpperCase());
    if (to.trim()) params.set('to', to.trim().toUpperCase());
    if (date) params.set('date', date);
    if (passengers) params.set('passengers', passengers);
    navigate(`/flights?${params.toString()}`);
  };

  const handleQuickRoute = route => {
    setFrom(route.origin);
    setTo(route.destination);
    navigate(`/flights?from=${route.origin}&to=${route.destination}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 tracking-wide uppercase">
              Next-Gen Travel Customer Service
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Explore the World with Confidence
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              Instant AI assistance for cancellation rules, visa requirements, and baggage policies — backed by verified policies and real-time operational notices.
            </p>
          </div>

          {/* Flight Search Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Origin Airport
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL or BOM"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Airport
                </label>
                <input
                  type="text"
                  placeholder="e.g. DXB, LHR, BKK"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Passengers
                </label>
                <select
                  value={passengers}
                  onChange={e => setPassengers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 font-medium"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>Search Flights</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Routes</h2>
            <p className="text-sm text-slate-500">Quickly check scheduled flights and demo fares</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_ROUTES.map((r, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickRoute(r)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {r.airline}
                </div>
                <div className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {r.origin} ➔ {r.destination}
                </div>
                <div className="text-xs text-slate-500">{r.label}</div>
              </div>
              <span className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all">
                ➔
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Airlines */}
      <section className="bg-slate-50 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">
            Integrated Carrier Network
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Budget Carrier</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">SkyNova Air</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Affordable regional routes across Dubai and Bangkok. Offers Economy Saver & Economy Flex fare tiers.
              </p>
              <div className="text-[11px] text-slate-400">Routes: SN-101, SN-202, SN-303</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Full Service Regional</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">ArcticJet</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Premium mid-range travel connecting Mumbai and Delhi to London, Tokyo, and Singapore with full baggage allowances.
              </p>
              <div className="text-[11px] text-slate-400">Routes: AJ-411, AJ-512, AJ-613</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">International Flagship</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">VistaAir</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Long-haul international routes to New York, London, and Tokyo featuring luxurious Business Sapphire cabins.
              </p>
              <div className="text-[11px] text-slate-400">Routes: VA-703, VA-801, VA-902</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
