import React, { useState } from "react";

const MONITOR_URL = import.meta.env.VITE_PHISFENCE_URL || "http://localhost:5000";

export default function BlacklistTab({ blacklist, onRefresh }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const add = async () => {
    const domain = input.trim().toLowerCase();
    if (!domain) return;
    setLoading(true); setError("");
    try {
      const r = await fetch(`${MONITOR_URL}/blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setInput("");
      onRefresh();
    } catch (e) {
      setError(`Failed to add domain: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (domain) => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${MONITOR_URL}/blacklist/${encodeURIComponent(domain)}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setConfirmRemove(null);
      onRefresh();
    } catch (e) {
      setError(`Failed to remove domain: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="panel">
        <div className="panel-title">Add Domain to Blacklist</div>
        <div className="bl-add-row">
          <input
            className="bl-input"
            type="text"
            placeholder="e.g. phishing-clone-site.com"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            disabled={loading}
          />
          <button className="btn btn-danger" onClick={add} disabled={loading || !input.trim()}>
            {loading ? <span className="spinner" /> : "＋"} Block Domain
          </button>
        </div>
        {error && <div className="error-bar" style={{ marginTop: 0 }}>⚠ {error}</div>}
      </div>

      <div className="panel">
        <div className="panel-title">
          Blocked Domains
          <span className="count">({blacklist.length})</span>
        </div>
        {blacklist.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <span className="empty-icon">🔓</span>
            No domains blocked yet.
          </div>
        ) : (
          <div className="bl-list">
            {blacklist.map(domain => (
              <div className="bl-item" key={domain}>
                <span className="bl-domain">{domain}</span>
                {confirmRemove === domain ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>Remove?</span>
                    <button className="btn btn-danger" style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => remove(domain)}>Yes</button>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => setConfirmRemove(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}
                    onClick={() => setConfirmRemove(domain)}>
                    ✕ Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="panel-title" style={{ color: "var(--accent-light)" }}>ℹ How it works</div>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
          When a domain is blocked, the PhisFence protect-lib embedded in the legitimate site
          will detect the clone in real-time via an SSE push (≤ 1 second) and immediately
          render a blocking overlay on the phishing page, disabling all interactions.
          Clones that have already loaded will be enforced within one SSE reconnect cycle.
        </p>
      </div>
    </div>
  );
}
