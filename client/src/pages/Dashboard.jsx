import React, { useState, useEffect } from 'react';

export default function Dashboard() {
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
      const res = await fetch(`/api/cases?status=${statusFilter}`);
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

    // Fetch full case if not already in state
    if (!caseDetails[id]) {
      try {
        const res = await fetch(`/api/cases/${id}`);
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
        body: JSON.stringify({ answer: answerInput.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const updatedCase = await res.json();
      setCaseDetails(prev => ({ ...prev, [id]: updatedCase }));
      setAnswerInput('');
      // Refresh list to update counts/status
      fetchCases();
    } catch (err) {
      alert('Error submitting answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Employee Fallback Dashboard</h2>
          <p className="muted">Review escalated customer questions and provide human answers.</p>
        </div>

        <div className="dashboard-controls">
          <div className="toggle-group">
            <button
              className={`toggle-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('pending'); setExpandedId(null); }}
            >
              Pending
            </button>
            <button
              className={`toggle-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('resolved'); setExpandedId(null); }}
            >
              Resolved
            </button>
          </div>

          <button className="refresh-btn" onClick={fetchCases} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="cases-list">
        {cases.length === 0 && !loading && (
          <div className="empty-state">
            <p>No {statusFilter} cases found.</p>
          </div>
        )}

        {cases.map(c => {
          const isExpanded = expandedId === c._id;
          const detail = caseDetails[c._id];

          return (
            <div key={c._id} className={`case-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="case-summary" onClick={() => toggleExpand(c._id)}>
                <div className="case-title-row">
                  <span className={`status-badge status-${c.status}`}>{c.status.toUpperCase()}</span>
                  <span className="case-question">{c.question}</span>
                </div>

                <div className="case-meta-row">
                  <span className="meta-item"><strong>Classification:</strong> {c.llmClassification || 'N/A'}</span>
                  <span className="meta-item"><strong>Reason:</strong> {c.reason || 'N/A'}</span>
                  <span className="meta-item"><strong>Created:</strong> {new Date(c.createdAt).toLocaleTimeString()}</span>
                  <span className="expand-indicator">{isExpanded ? '▲ Collapse' : '▼ Expand'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="case-expanded-content">
                  {!detail ? (
                    <p className="muted">Loading case details...</p>
                  ) : (
                    <>
                      <div className="detail-section">
                        <h4>Customer Question</h4>
                        <p className="question-callout">{detail.question}</p>
                      </div>

                      {/* OKF Evidence */}
                      <div className="detail-section">
                        <h4>OKF Policy Evidence</h4>
                        {detail.okfEvidence ? (
                          <div className="evidence-box okf-box">
                            <p><strong>File:</strong> <code>{detail.okfEvidence.filename}</code></p>
                            <p><strong>Title:</strong> {detail.okfEvidence.title}</p>
                            <p><strong>Topic:</strong> {detail.okfEvidence.topic}</p>
                            <p><strong>Status:</strong> {detail.okfEvidence.status} | <strong>Verified:</strong> {detail.okfEvidence.verified || 'N/A'} | <strong>Stale After:</strong> {detail.okfEvidence.stale_after || 'N/A'}</p>
                            <p><strong>Keyword Score:</strong> {detail.okfEvidence.score !== undefined ? detail.okfEvidence.score.toFixed(4) : 'N/A'}</p>
                            <div className="excerpt-box">
                              <strong>Excerpt:</strong>
                              <pre>{detail.okfEvidence.excerpt}...</pre>
                            </div>
                          </div>
                        ) : (
                          <p className="muted">No OKF policy file matched.</p>
                        )}
                      </div>

                      {/* RAG Evidence */}
                      <div className="detail-section">
                        <h4>RAG Event Notices</h4>
                        {detail.ragEvidence && detail.ragEvidence.length > 0 ? (
                          <div className="rag-evidence-list">
                            {detail.ragEvidence.map((chunk, idx) => (
                              <div key={idx} className="evidence-box rag-box">
                                <p>
                                  <strong>Chunk ID:</strong> <code>{chunk.id}</code> | 
                                  <strong> Similarity:</strong> {chunk.similarity !== null && chunk.similarity !== undefined ? chunk.similarity.toFixed(4) : 'N/A'} | 
                                  <strong> Date:</strong> {chunk.timestamp ? new Date(chunk.timestamp * 1000).toLocaleDateString() : 'N/A'}
                                </p>
                                <p>
                                  <strong>Source:</strong> {chunk.source_type} | 
                                  <strong> Flight:</strong> {chunk.flight_no || 'None'} | 
                                  <strong> Route:</strong> {chunk.route || 'None'}
                                </p>
                                <div className="excerpt-box">
                                  <pre>{chunk.text}</pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="muted">No RAG notices retrieved.</p>
                        )}
                      </div>

                      {/* Resolution Section */}
                      <div className="detail-section resolution-section">
                        <h4>Employee Resolution</h4>
                        {detail.status === 'resolved' ? (
                          <div className="resolved-box">
                            <p><strong>Final Answer:</strong></p>
                            <p className="resolved-answer-text">{detail.finalAnswer}</p>
                            <p className="muted">Resolved at: {detail.resolvedAt ? new Date(detail.resolvedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        ) : (
                          <div className="resolve-form">
                            <textarea
                              rows={4}
                              placeholder="Type human response to send back to customer..."
                              value={answerInput}
                              onChange={e => setAnswerInput(e.target.value)}
                              disabled={submitting}
                            />
                            <button
                              className="submit-answer-btn"
                              onClick={() => handleResolve(detail._id)}
                              disabled={submitting || !answerInput.trim()}
                            >
                              {submitting ? 'Submitting...' : 'Submit Answer'}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
