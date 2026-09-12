import React, { useEffect, useState, useCallback } from "react";

const INTEGRATION_API = "http://localhost:8001";

const SEVERITY_COLOR = {
  HIGH: "#ff4d4d",
  MEDIUM: "#ff9800",
  LOW: "#4caf50",
};

const SEVERITY_ICON = {
  HIGH: "🔴",
  MEDIUM: "🟠",
  LOW: "🟢",
};

function ago(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function Badge({ severity }) {
  return (
    <span
      style={{
        background: SEVERITY_COLOR[severity] || "#888",
        color: "#fff",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {SEVERITY_ICON[severity]} {severity}
    </span>
  );
}

function SourcePill({ label, active }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "#6366f1" : "#333"}`,
        color: active ? "#a5b4fc" : "#555",
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 11,
        marginRight: 4,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

export default function IncidentPanel() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${INTEGRATION_API}/incidents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIncidents(data.reverse()); // newest first
      setError(null);
    } catch (e) {
      setError("Integration service unreachable — start it on port 8001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <section className="panel incident-panel">
      <div className="incident-header">
        <div>
          <h2 style={{ margin: 0 }}>🔗 Corroborated Incidents</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            Unified events from PhisFence + PhishShield
          </p>
        </div>
        <button className="refresh-btn" onClick={load} disabled={loading}>
          {loading ? "⟳" : "↺ Refresh"}
        </button>
      </div>

      {error && (
        <div className="incident-error">
          ⚠️ {error}
        </div>
      )}

      {!error && incidents.length === 0 && !loading && (
        <div className="incident-empty">No incidents yet. Waiting for events...</div>
      )}

      <div className="incident-list">
        {incidents.map((inc) => {
          const isOpen = expanded === inc.incident_id;
          return (
            <div
              key={inc.incident_id}
              className={`incident-card ${inc.severity}`}
              onClick={() => setExpanded(isOpen ? null : inc.incident_id)}
            >
              <div className="incident-card-top">
                <div className="incident-card-left">
                  <Badge severity={inc.severity} />
                  <span className="incident-status">{inc.status}</span>
                </div>
                <span className="incident-time">{ago(inc.updated_at)}</span>
              </div>

              <div className="incident-clone">
                <span className="label">Suspected Clone:</span>{" "}
                <code>{inc.suspected_clone}</code>
              </div>
              {inc.protected_site && (
                <div className="incident-clone">
                  <span className="label">Protected Site:</span>{" "}
                  <code>{inc.protected_site}</code>
                </div>
              )}

              <div className="source-pills">
                <SourcePill label="PhisFence 🛡️" active={!!inc.phisfence} />
                <SourcePill label="PhishShield 🔍" active={!!inc.phishshield} />
              </div>

              {isOpen && (
                <div className="incident-detail">
                  {inc.phisfence && (
                    <div className="detail-block">
                      <strong>PhisFence Evidence</strong>
                      <pre>{JSON.stringify(inc.phisfence.evidence, null, 2)}</pre>
                    </div>
                  )}
                  {inc.phishshield && (
                    <div className="detail-block">
                      <strong>PhishShield Result</strong>
                      <table className="detail-table">
                        <tbody>
                          <tr><td>Classification</td><td>{inc.phishshield.classification}</td></tr>
                          <tr><td>Risk Score</td><td>{(inc.phishshield.risk_score ?? 0).toFixed(1)}</td></tr>
                          <tr><td>Confidence</td><td>{((inc.phishshield.confidence ?? 0) * 100).toFixed(1)}%</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
