/**
 * client/src/pages/staff/SupportQueue.jsx
 *
 * Staff Support Queue (migrated from Phase 2B Dashboard).
 * Displays pending and resolved cases with OKF/RAG evidence and asker identity.
 */

import React, { useState, useEffect } from 'react';

export default function SupportQueue() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [caseDetails, setCaseDetails] = useState({});
  const [answerInput, setAnswerInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCases() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cases?status=${statusFilter}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      setError('Failed to fetch cases: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setAnswerInput('');
      return;
    }

    setExpandedId(id);
    setAnswerInput('');

    if (!caseDetails[id]) {
      try {
        const res = await fetch(`/api/cases/${id}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCaseDetails(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error('Failed to fetch case detail:', err);
      }
    }
  }

  async function handleResolve(id) {
    if (!answerInput.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answer: answerInput.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const updatedCase = await res.json();
      setCaseDetails(prev => ({ ...prev, [id]: updatedCase }));
      setAnswerInput('');
      fetchCases();
    } catch (err) {
      alert('Error submitting answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Staff Control Center
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Support Escalation Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review escalated questions, inspect retrieved OKF and RAG evidence, and provide human responses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => {
                  setStatusFilter('pending');
                  setExpandedId(null);
                }}
              >
                Pending Cases
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'resolved'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => {
                  setStatusFilter('resolved');
                  setExpandedId(null);
                }}
              >
                Resolved History
              </button>
            </div>

            <button
              onClick={fetchCases}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
              title="Refresh queue"
            >
              🔄
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Case List */}
        {loading && cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></span>
            <span className="text-sm">Refreshing case queue...</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl mb-3 block">🎉</span>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No {statusFilter === 'pending' ? 'Pending' : 'Resolved'} Cases
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'All customer support tickets are currently resolved.'
                : 'No resolved tickets found in the archive.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map(c => {
              const isExpanded = expandedId === c._id;
              const detail = caseDetails[c._id];

              return (
                <div
                  key={c._id}
                  className={`bg-white rounded-xl border transition-all ${
                    isExpanded ? 'border-sky-500 shadow-md ring-1 ring-sky-500/20' : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Case Summary Card Bar */}
                  <div
                    onClick={() => toggleExpand(c._id)}
                    className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            c.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {c.llmClassification || 'ESCALATE'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Reason: {c.reason || 'manual'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()} at{' '}
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-base font-bold text-slate-900 leading-snug">
                        "{c.question}"
                      </div>

                      {/* Asker Details */}
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Asker:</span>
                        {c.asker ? (
                          <span className="text-sky-700 font-medium">
                            {c.asker.name} ({c.asker.email}) [ID: {c.asker.customerId}]
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Guest User (Not logged in)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                        {isExpanded ? 'Hide Evidence ▲' : 'Inspect Evidence ▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && detail && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-6 space-y-6">
                      {/* Evidence Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* OKF Evidence */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                              OKF Policy Match
                            </span>
                            {detail.okfEvidence && (
                              <span className="text-[11px] font-mono bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">
                                Score: {detail.okfEvidence.score?.toFixed(4) ?? '0.0000'}
                              </span>
                            )}
                          </div>

                          {detail.okfEvidence ? (
                            <div className="text-xs space-y-2 text-slate-600">
                              <div className="font-semibold text-slate-900">
                                {detail.okfEvidence.title || detail.okfEvidence.filename}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Topic: {detail.okfEvidence.topic} • Status: {detail.okfEvidence.status} • Verified: {detail.okfEvidence.verified || 'n/a'}
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-100 font-mono text-[11px] text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                                {detail.okfEvidence.excerpt}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">
                              No matching OKF policy file retrieved for this inquiry.
                            </p>
                          )}
                        </div>

                        {/* RAG Evidence */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                              RAG Event Notices ({detail.ragEvidence?.length || 0})
                            </span>
                          </div>

                          {detail.ragEvidence && detail.ragEvidence.length > 0 ? (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {detail.ragEvidence.map((rag, rIdx) => (
                                <div key={rIdx} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-mono font-bold text-slate-800">{rag.id}</span>
                                    <span className="text-sky-700 font-mono">
                                      Sim: {rag.similarity !== null ? Number(rag.similarity).toFixed(3) : 'n/a'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Type: {rag.source_type} {rag.flight_no && `• Flight: ${rag.flight_no}`} {rag.route && `• Route: ${rag.route}`}
                                  </div>
                                  <p className="text-slate-700 text-[11px] leading-relaxed">
                                    {rag.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">
                              No RAG event chunks retrieved above similarity floor.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Resolution View or Form */}
                      {detail.status === 'resolved' ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                            <span>✓ Resolved by Team Member</span>
                            <span className="text-[11px] font-normal text-emerald-600">
                              at {new Date(detail.resolvedAt).toLocaleString()}
                            </span>
                          </span>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {detail.finalAnswer}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Employee Resolution Reply
                          </label>
                          <textarea
                            rows={4}
                            value={answerInput}
                            onChange={e => setAnswerInput(e.target.value)}
                            placeholder="Write an authoritative resolution based on policy facts and event records..."
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedId(null)}
                              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!answerInput.trim() || submitting}
                              onClick={() => handleResolve(c._id)}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                            >
                              {submitting ? 'Submitting...' : 'Submit Resolution'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
