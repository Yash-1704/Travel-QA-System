/**
 * client/src/components/ChatWidget.jsx
 *
 * Floating customer assistant widget (V2 classify-then-retrieve).
 * Appears on public and customer pages; excluded from /staff/* and /lab/chat.
 * Supports citations, escalation handling, and polling GET /api/cases/:id/reply every 5s.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your travel assistant. Ask me anything about luggage limits, cancellation policies, visa rules, or delay records.',
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [preselectedBooking, setPreselectedBooking] = useState(null);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Exclude from staff routes and lab chat
  const shouldHide = location.pathname.startsWith('/staff') || location.pathname === '/lab/chat';

  // Listen for 'tq-open-chat-booking' event from MyBookings
  useEffect(() => {
    const handleOpenWithBooking = e => {
      const detail = e.detail;
      if (detail && detail.bookingId) {
        setIsOpen(true);
        setPreselectedBooking(detail);
        setInput(`Why was my flight ${detail.flightNo} delayed?`);
      }
    };
    window.addEventListener('tq-open-chat-booking', handleOpenWithBooking);
    return () => window.removeEventListener('tq-open-chat-booking', handleOpenWithBooking);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for escalation reply when activeCaseId changes
  useEffect(() => {
    if (!activeCaseId) return;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/cases/${activeCaseId}/reply`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'resolved' && data.finalAnswer) {
            setMessages(prev => [
              ...prev,
              {
                role: 'staff',
                text: data.finalAnswer,
                resolvedCaseId: activeCaseId
              }
            ]);
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setActiveCaseId(null);
          }
        }
      } catch (err) {
        console.error('Widget reply polling error:', err);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeCaseId]);

  const processChatResponse = (data, query) => {
    if (data.outcome === 'CLARIFY') {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.message || 'Which booking do you mean?',
          isClarify: true,
          originalQuestion: query,
          options: data.options || []
        }
      ]);
    } else if (data.outcome === 'ESCALATED') {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.message || 'A team member will get back to you shortly.',
          isEscalated: true,
          caseId: data.caseId,
          appliedBooking: data.appliedBooking || null
        }
      ]);
      if (data.caseId) {
        setActiveCaseId(data.caseId);
      }
    } else {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'No answer available.',
          citations: data.citations || [],
          appliedBooking: data.appliedBooking || null
        }
      ]);
    }
  };

  const handleSelectOption = async (originalQuestion, bookingId) => {
    if (loading) return;
    setLoading(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `Selected booking ${bookingId}` }
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: originalQuestion, bookingId, system: 'v2' })
      });
      const data = await res.json();
      processChatResponse(data, originalQuestion);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error connecting to support.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async e => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const payload = { question: query, system: 'v2' };
    if (preselectedBooking?.bookingId) {
      payload.bookingId = preselectedBooking.bookingId;
    }
    setPreselectedBooking(null);

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      processChatResponse(data, query);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error connecting to support.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-full shadow-lg shadow-sky-600/30 hover:scale-105 transition-all font-semibold text-sm group"
        >
          <span className="text-lg">💬</span>
          <span>Ask Travel Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[380px] sm:w-[420px] h-[540px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold">
                QA
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Travel Assistant</div>
                <div className="text-[10px] text-sky-400 font-mono">V2 Classify-First Engine</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : m.role === 'staff'
                      ? 'bg-emerald-50 border border-emerald-200 text-slate-800 rounded-bl-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {m.role === 'staff' && (
                    <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <span>✓ Team Member Reply</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Using booking tag */}
                  {m.appliedBooking && (
                    <div className="text-[11px] text-slate-500 mt-1 font-mono italic">
                      Using booking {m.appliedBooking}
                    </div>
                  )}

                  {/* Clarification booking buttons */}
                  {m.isClarify && m.options && m.options.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {m.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(m.originalQuestion, opt.bookingId)}
                          disabled={loading}
                          className="text-left p-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs text-sky-950 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>
                              {opt.bookingId}: {opt.flightNo} • {opt.route}
                            </span>
                            <span className="text-[10px] text-sky-700 font-mono font-medium">
                              {opt.airline}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Travel date: {opt.date}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {m.citations.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200"
                        >
                          [{c.type}: {c.id}]
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Escalation Tag */}
                  {m.isEscalated && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5">
                      <span className="animate-pulse">⏳</span>
                      <span>Escalated to human support queue</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                <span>Searching policies & delay notices...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preselected Booking Indicator */}
          {preselectedBooking && (
            <div className="px-3 py-1.5 bg-sky-50 border-t border-sky-100 flex items-center justify-between text-xs text-sky-900">
              <span className="truncate">
                Referencing booking: <strong className="font-semibold">{preselectedBooking.bookingId}</strong> ({preselectedBooking.flightNo})
              </span>
              <button
                type="button"
                onClick={() => setPreselectedBooking(null)}
                className="text-sky-600 hover:text-sky-900 font-bold ml-2 cursor-pointer"
                title="Remove booking context"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about flights, baggage, visas..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
