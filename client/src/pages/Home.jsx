/**
 * client/src/pages/Home.jsx
 *
 * Landing page: flight search form, dynamic popular routes, dynamic carrier network, and demo data disclaimer.
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGENCY_NAME, DEMO_DATA_NOTICE } from '../config.js';

// Assets
import heroBg from '../assets/hero-bg.jpg';
import dxbImg from '../assets/routes/dxb.jpg';
import lhrImg from '../assets/routes/lhr.jpg';
import bkkImg from '../assets/routes/bkk.jpg';
import sinImg from '../assets/routes/sin.jpg';
import nrtImg from '../assets/routes/nrt.jpg';
import jfkImg from '../assets/routes/jfk.jpg';

import skynovaImg from '../assets/carriers/skynova.jpg';
import arcticjetImg from '../assets/carriers/arcticjet.jpg';
import vistaairImg from '../assets/carriers/vistaair.jpg';

const POPULAR_ROUTES = [
  {
    origin: 'DEL',
    destination: 'DXB',
    label: 'Delhi to Dubai',
    airline: 'SkyNova Air',
    tag: 'GLOBAL HUB',
    image: dxbImg,
    description: 'Experience futuristic architecture, luxury desert safaris, and vibrant trade ports with seamless non-stop flights.'
  },
  {
    origin: 'BOM',
    destination: 'LHR',
    label: 'Mumbai to London',
    airline: 'ArcticJet',
    tag: 'HERITAGE CAPITAL',
    image: lhrImg,
    description: 'Direct transcontinental connectivity from Mumbai to London Heathrow with full baggage and premium dining.'
  },
  {
    origin: 'DEL',
    destination: 'BKK',
    label: 'Delhi to Bangkok',
    airline: 'SkyNova Air',
    tag: 'TROPICAL RETREAT',
    image: bkkImg,
    description: 'Affordable regional getaways to vibrant Bangkok night markets, serene floating temples, and warm hospitality.'
  },
  {
    origin: 'BOM',
    destination: 'SIN',
    label: 'Mumbai to Singapore',
    airline: 'ArcticJet',
    tag: 'GARDEN CITY',
    image: sinImg,
    description: 'Fly seamlessly from Mumbai to Changi Airport, the world’s benchmark for global transit and lush urban wonders.'
  },
  {
    origin: 'DEL',
    destination: 'NRT',
    label: 'Delhi to Tokyo',
    airline: 'VistaAir',
    tag: 'EAST ASIAN METROPOLIS',
    image: nrtImg,
    description: 'Indulge in international flagship journeys to Tokyo Narita with authentic hospitality and modern cabin suites.'
  },
  {
    origin: 'BOM',
    destination: 'JFK',
    label: 'Mumbai to New York',
    airline: 'VistaAir',
    tag: 'ICONIC SKYLINE',
    image: jfkImg,
    description: 'Connect India’s commercial capital directly to New York City with premier comfort across all service classes.'
  }
];

const CARRIERS = [
  {
    name: 'SkyNova Air',
    category: 'Budget Carrier',
    description: 'Affordable regional routes across Dubai and Bangkok. Offers Economy Saver & Economy Flex fare tiers.',
    routes: 'Routes: SN-101, SN-202, SN-303',
    image: skynovaImg,
    badgeColor: 'bg-sky-500/80 text-white'
  },
  {
    name: 'ArcticJet',
    category: 'Full Service Regional',
    description: 'Premium mid-range travel connecting Mumbai and Delhi to London, Tokyo, and Singapore with full baggage allowances.',
    routes: 'Routes: AJ-411, AJ-512, AJ-613',
    image: arcticjetImg,
    badgeColor: 'bg-cyan-500/80 text-white'
  },
  {
    name: 'VistaAir',
    category: 'International Flagship',
    description: 'Long-haul international routes to New York, London, and Tokyo featuring luxurious Business Sapphire cabins.',
    routes: 'Routes: VA-703, VA-801, VA-902',
    image: vistaairImg,
    badgeColor: 'bg-indigo-500/80 text-white'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const searchFormRef = useRef(null);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  // Popular Routes interactive showcase state
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);

  // Carriers carousel interactive state
  const [carrierIdx, setCarrierIdx] = useState(0);

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

  const handleSelectRouteAndPopulate = (route, idx) => {
    setActiveRouteIdx(idx);
    setFrom(route.origin);
    setTo(route.destination);
    // Smoothly scroll to the search form for clear user visibility
    if (searchFormRef.current) {
      searchFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevRoute = () => {
    setActiveRouteIdx(prev => (prev === 0 ? POPULAR_ROUTES.length - 1 : prev - 1));
  };

  const handleNextRoute = () => {
    setActiveRouteIdx(prev => (prev === POPULAR_ROUTES.length - 1 ? 0 : prev + 1));
  };

  const handlePrevCarrier = () => {
    setCarrierIdx(prev => (prev === 0 ? CARRIERS.length - 1 : prev - 1));
  };

  const handleNextCarrier = () => {
    setCarrierIdx(prev => (prev === CARRIERS.length - 1 ? 0 : prev + 1));
  };

  const activeRoute = POPULAR_ROUTES[activeRouteIdx];

  return (
    <div className="flex-1 flex flex-col w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        {/* Background Image - Clear, Visible & Evident */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src={heroBg}
            alt="World Skyline Backdrop"
            className="w-full h-full object-cover object-bottom opacity-95"
          />
          {/* Subtle gradient to keep text readable while showcasing the skyline reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/35 to-slate-950/85"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-sky-400 border border-sky-400/30 backdrop-blur-sm mb-4 tracking-wide uppercase shadow-sm">
              Next-Gen Travel Customer Service
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Explore the World, Wander with Confidence
            </h1>
            <p className="text-base sm:text-lg text-slate-100 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] font-medium">
              Instant AI assistance for cancellation rules, visa requirements, and baggage policies — backed by verified policies and real-time operational notices.
            </p>
          </div>

          {/* Flight Search Form */}
          <div
            ref={searchFormRef}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100"
          >
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

      {/* Popular Routes Section - Dynamic UI (Video 1 Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-sky-600 uppercase">
              Curated Flight Connections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Popular Routes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Quickly check scheduled flights, select destinations, and auto-populate your search
            </p>
          </div>
        </div>

        {/* Video 1 Interaction Reference: Showcase Component */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-10 mb-8 shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Stepper & Information Panel */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Large Counter & Stepper Navigation */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-5xl sm:text-7xl font-black text-rose-500/90 tracking-tighter transition-all duration-300">
                    {`0${activeRouteIdx + 1}`}
                  </span>
                  <div className="text-[11px] sm:text-xs uppercase font-semibold text-slate-400 tracking-wider leading-tight">
                    <span>clicks from</span>
                    <br />
                    <span>your next journey</span>
                  </div>
                </div>

                {/* Circular Stepper Navigation Arrows */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevRoute}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer"
                    title="Previous destination"
                    aria-label="Previous destination"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={handleNextRoute}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer"
                    title="Next destination"
                    aria-label="Next destination"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Destination Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
                    CHOOSE ROUTE
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">
                    {activeRoute.airline}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeRoute.origin} ➔ {activeRoute.destination}
                  <span className="block text-lg font-semibold text-slate-600 mt-0.5">
                    {activeRoute.label}
                  </span>
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  {activeRoute.description}
                </p>
              </div>

              {/* Action Buttons: Populate Form & Direct Search */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleSelectRouteAndPopulate(activeRoute, activeRouteIdx)}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:shadow-md"
                >
                  <span>Select & Fill Search Form</span>
                  <span>↑</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoute(activeRoute)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Quick Search Flights</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* Right Circular Destination Visualizer (Video 1 reference) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Outer Orbit Path Ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-slate-300 animate-[spin_60s_linear_infinite] pointer-events-none"></div>

                {/* Orbit Marker Dot */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-md transition-all duration-500 z-20"
                  style={{
                    top: `${50 - 48 * Math.cos(((activeRouteIdx * 60) * Math.PI) / 180)}%`,
                    left: `${50 + 48 * Math.sin(((activeRouteIdx * 60) * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                ></div>

                {/* Circular Masked Destination Imagery */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-xl border-4 border-white relative z-10 group">
                  <img
                    key={activeRoute.destination}
                    src={activeRoute.image}
                    alt={activeRoute.label}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  {/* Frosted Center Badge with Airplane Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg text-white text-xl">
                      ✈
                    </div>
                  </div>

                  {/* Destination Tag Chip at Bottom */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/20">
                      {activeRoute.destination} • {activeRoute.airline}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Interactive Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_ROUTES.map((r, idx) => {
            const isActive = idx === activeRouteIdx;
            return (
              <div
                key={idx}
                onClick={() => handleSelectRouteAndPopulate(r, idx)}
                className={`bg-white rounded-xl p-5 border transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md bg-sky-50/20'
                    : 'border-slate-200 hover:border-sky-500 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                      {r.airline}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {r.origin} ➔ {r.destination}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.label}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-sm transition-transform ${
                      isActive ? 'text-sky-600 translate-x-1' : 'text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1'
                    }`}
                  >
                    ➔
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integrated Carrier Network - Dynamic Carousel UI (Video 2 Reference) */}
      <section className="bg-slate-950 text-white border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                Aviation Partners
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Integrated Carrier Network
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
                Verified airline schedules and unified baggage, cancellation, and ticket tier policies.
              </p>
            </div>

            {/* Video 2 Carousel Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevCarrier}
                className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 text-white hover:bg-sky-600 hover:border-sky-500 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Previous airline"
                aria-label="Previous airline"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextCarrier}
                className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 text-white hover:bg-sky-600 hover:border-sky-500 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Next airline"
                aria-label="Next airline"
              >
                ›
              </button>
            </div>
          </div>

          {/* Luxury Carousel Cards (Video 2 Reference) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CARRIERS.map((carrier, idx) => {
              const isSelected = idx === carrierIdx;
              return (
                <div
                  key={carrier.name}
                  onClick={() => setCarrierIdx(idx)}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-end min-h-[440px] group cursor-pointer ${
                    isSelected
                      ? 'border-sky-500/80 ring-2 ring-sky-500/40 shadow-2xl shadow-sky-950/50'
                      : 'border-slate-800 hover:border-slate-600 hover:shadow-xl'
                  }`}
                >
                  {/* Full-bleed Aviation Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={carrier.image}
                      alt={carrier.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Multi-stage dark gradient overlay for text readability (matches reference) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20"></div>
                  </div>

                  {/* Top Badge: Category chip */}
                  <div className="absolute top-5 left-5 z-10">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-900/80 backdrop-blur-md text-sky-400 border border-sky-400/30">
                      {carrier.category}
                    </span>
                  </div>

                  {/* Card Content Overlay */}
                  <div className="relative z-10 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-sky-300 transition-colors">
                      {carrier.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">
                      {carrier.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      <span>{carrier.routes}</span>
                    </div>

                    {/* Interactive Button */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/flights');
                      }}
                      className="mt-4 w-full py-2.5 px-4 rounded-lg border border-white/20 hover:border-sky-400 hover:bg-sky-500/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-slate-950"
                    >
                      <span>Explore Carrier Flights</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {CARRIERS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCarrierIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  carrierIdx === idx ? 'w-8 bg-sky-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to airline slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Demo Data Disclaimer Section */}
      <section className="bg-slate-900/90 text-slate-400 border-t border-slate-800 py-4 px-4 text-center text-xs">
        <p className="max-w-4xl mx-auto leading-relaxed">
          {DEMO_DATA_NOTICE}
        </p>
      </section>
    </div>
  );
}
