/**
 * client/src/pages/MySupport.jsx
 *
 * Customer support history page displaying escalated questions and staff replies from GET /api/cases/mine.
 */

import React, { useState, useEffect } from 'react';

export default function MySupport() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/cases/mine');
        if (!res.ok) {
          throw new Error('Failed to load support requests.');
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.cases;
        setCases(list || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Support Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries that were escalated to our agency team members for manual review.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
            <span className="text-sm">Loading support inquiries...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl mb-3 block">💬</span>
            <h3 className="text-base font-bold text-slate-800 mb-1">No Support Inquiries</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any questions requiring human review from our chat widget will appear here with team replies.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map(c => (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()} at{' '}
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Case #{c._id.slice(-6)}</span>
                </div>

                {/* Customer Question */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Question
                  </span>
                  <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{c.question}"
                  </p>
                </div>

                {/* Team Reply */}
                {c.status === 'resolved' && c.finalAnswer ? (
                  <div className="bg-emerald-50/60 border border-emerald-200/70 p-3.5 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      <span>✓ Team Member Answer</span>
                      {c.resolvedAt && (
                        <span className="text-[10px] text-emerald-600 font-normal">
                          ({new Date(c.resolvedAt).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {c.finalAnswer}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/60 border border-amber-200/50 p-2.5 rounded-lg">
                    <span className="text-base">⏳</span>
                    <span>An agent is currently reviewing your inquiry. We'll update this reply shortly.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
