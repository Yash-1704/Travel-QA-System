/**
 * client/src/pages/FlightSearch.jsx
 *
 * Flight search results page with sorting and filters.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FlightCard from '../components/FlightCard.jsx';

export default function FlightSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';
  const sort = searchParams.get('sort') || 'departure';

  // Search input state
  const [fromInput, setFromInput] = useState(from);
  const [toInput, setToInput] = useState(to);
  const [dateInput, setDateInput] = useState(date);
  const [passInput, setPassInput] = useState(passengers);

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (from) query.set('from', from);
        if (to) query.set('to', to);
        if (date) query.set('date', date);
        if (passengers) query.set('passengers', passengers);
        if (sort) query.set('sort', sort);

        const res = await fetch(`/api/flights?${query.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch flight results');
        }
        const data = await res.json();
        setFlights(data.flights || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [from, to, date, passengers, sort]);

  const handleFilterSubmit = e => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (fromInput.trim()) next.set('from', fromInput.trim().toUpperCase());
    if (toInput.trim()) next.set('to', toInput.trim().toUpperCase());
    if (dateInput) next.set('date', dateInput);
    if (passInput) next.set('passengers', passInput);
    if (sort) next.set('sort', sort);
    setSearchParams(next);
  };

  const handleSortChange = newSort => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    setSearchParams(next);
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From</label>
              <input
                type="text"
                value={fromInput}
                onChange={e => setFromInput(e.target.value)}
                placeholder="Origin (e.g. DEL)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-sky-500 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">To</label>
              <input
                type="text"
                value={toInput}
                onChange={e => setToInput(e.target.value)}
                placeholder="Destination (e.g. DXB)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-sky-500 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date</label>
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Passengers</label>
              <select
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                Update Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Header with Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {from && to ? `${from} to ${to}` : 'All Available Flights'}
            </h1>
            <p className="text-xs text-slate-500">
              {flights.length} future flight{flights.length === 1 ? '' : 's'} matching criteria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort by:</span>
            <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex text-xs font-medium">
              <button
                onClick={() => handleSortChange('departure')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  sort === 'departure' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Departure Time
              </button>
              <button
                onClick={() => handleSortChange('price')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  sort === 'price' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cheapest Price
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
            <span className="text-sm">Searching flight schedules...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        ) : flights.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl mb-3 block">🛫</span>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Flights Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              We couldn't find any flights matching your criteria. Try adjusting the date, passenger count, or selecting a different route.
            </p>
            <button
              onClick={() => {
                setFromInput('');
                setToInput('');
                setDateInput('');
                setSearchParams({});
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map(f => (
              <FlightCard key={f.id || f._id} flight={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
