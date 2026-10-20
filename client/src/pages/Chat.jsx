import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_OPTIONS = ['v1', 'v2'];

function CitationChip({ type, id }) {
  const label = type === 'OKF' ? `OKF: ${id}` : `RAG: ${id}`;
  const cls = type === 'OKF' ? 'chip chip-okf' : 'chip chip-rag';
  return <span className={cls}>{label}</span>;
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-bubble">
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <>
            <p className={msg.outcome === 'ESCALATED' ? 'escalated-text' : ''}>
              {msg.content}
            </p>

            {/* Citations */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="citations">
                {msg.citations.map((c, i) => (
                  <CitationChip key={i} type={c.type} id={c.id} />
                ))}
              </div>
            )}

            {/* Escalation reason */}
            {msg.escalationReason && (
              <p className="muted">Escalation reason: {msg.escalationReason}</p>
            )}

            {/* Error inline */}
            {msg.error && (
              <p className="error-text">{msg.error}</p>
            )}

            {/* Debug token info */}
            {msg.tokens && (
              <p className="muted debug-tokens">
                tokens: {msg.tokens.total} (prompt: {msg.tokens.prompt}, completion: {msg.tokens.completion})
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [system, setSystem] = useState('v1');
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, system })
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || `Server error ${res.status}`;
        if (res.status === 503) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: null,
            error: errMsg,
            outcome: 'ERROR'
          }]);
        } else {
          setError(errMsg);
        }
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'A team member will get back to you shortly.',
        outcome: data.outcome,
        citations: data.citations || [],
        escalationReason: data.escalationReason,
        tokens: data.tokens,
        retrieved: data.retrieved
      }]);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Travel QA Support</h1>
        <div className="system-selector">
          <label htmlFor="system-select">System:</label>
          <select
            id="system-select"
            value={system}
            onChange={e => setSystem(e.target.value)}
            disabled={loading}
          >
            {SYSTEM_OPTIONS.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Ask a travel support question to get started.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <div className="message message-assistant">
            <div className="message-bubble loading-bubble">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="input-area">
        <textarea
          id="chat-input"
          placeholder="Ask a travel question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={2}
          maxLength={1000}
        />
        <button
          id="send-btn"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
