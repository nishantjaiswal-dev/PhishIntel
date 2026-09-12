import React, { useEffect, useRef, useState } from "react";

const INTEGRATION_URL = import.meta.env.VITE_INTEGRATION_URL || "http://localhost:8001";
const API_KEY = import.meta.env.VITE_API_KEY || "phishdefense-dev-key-change-in-prod";

const SMAP = { CRITICAL: "badge-critical", HIGH: "badge-high", MEDIUM: "badge-medium", LOW: "badge-low" };

function ago(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function SeverityBadge({ s }) {
  const icons = { CRITICAL: "💀", HIGH: "🔴", MEDIUM: "🟠", LOW: "🟢" };
  return <span className={`badge ${SMAP[s] || "badge-low"}`}>{icons[s] || "⚪"} {s}</span>;
}

function StatusBadge({ s }) {
  return <span className={`status-badge ${s}`}>{s?.replace("_", " ")}</span>;
}

const STATUS_CYCLE = ["NEW", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"];

export default function IncidentTab({ onCountChange }) {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState({ severity: "", status: "" });
  const [expanded, setExpanded] = useState(null);
  const [sseStatus, setSseStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    function connect() {
      if (esRef.current) esRef.current.close();
      const es = new EventSource(`${INTEGRATION_URL}/incidents/stream`);
      esRef.current = es;

      es.addEventListener("snapshot", (e) => {
        try { setIncidents(JSON.parse(e.data)); setSseStatus("live"); setError(null); } catch {}
      });
      es.addEventListener("update", (e) => {
        try {
          const msg = JSON.parse(e.data);
          setIncidents(prev => {
            const idx = prev.findIndex(i => i.incident_id === msg.data?.incident_id);
            if (idx >= 0) { const next = [...prev]; next[idx] = msg.data; return next; }
            return [msg.data, ...prev];
          });
        } catch {}
      });
      es.onerror = () => {
        setSseStatus("error");
        setError("Integration service unreachable — start it on port 8001");
        es.close();
        setTimeout(connect, 5000);
      };
    }
    connect();
    return () => esRef.current?.close();
  }, []);

  useEffect(() => {
    onCountChange?.(incidents.filter(i => i.status === "NEW").length);
  }, [incidents]);

  const filtered = incidents.filter(i =>
    (!filter.severity || i.severity === filter.severity) &&
    (!filter.status   || i.status   === filter.status)
  );

  const counts = incidents.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1;
    return acc;
  }, {});

  async function updateStatus(incId, newStatus) {
    try {
      await fetch(`${INTEGRATION_URL}/incidents/${encodeURIComponent(incId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-row">
        {[
          { label: "Total", value: incidents.length, cls: "" },
          { label: "Critical", value: counts.CRITICAL || 0, cls: "red" },
          { label: "High", value: counts.HIGH || 0, cls: "orange" },
          { label: "Medium", value: counts.MEDIUM || 0, cls: "purple" },
          { label: "Low", value: counts.LOW || 0, cls: "green" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {error && <div className="error-bar">⚠ {error}</div>}

      {/* Filters */}
      <div className="panel" style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--text-2)" }}>Filter:</span>
          {["", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(sv => (
            <button key={sv} className={`btn btn-ghost`}
              style={filter.severity === sv ? { borderColor: "var(--accent)", color: "var(--accent-light)" } : {}}
              onClick={() => setFilter(f => ({ ...f, severity: sv }))}>
              {sv || "All Severity"}
            </button>
          ))}
          <div style={{ height: 20, borderLeft: "1px solid var(--border)", margin: "0 4px" }} />
          {["", "NEW", "INVESTIGATING", "RESOLVED"].map(st => (
            <button key={st} className="btn btn-ghost"
              style={filter.status === st ? { borderColor: "var(--accent)", color: "var(--accent-light)" } : {}}
              onClick={() => setFilter(f => ({ ...f, status: st }))}>
              {st || "All Status"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {sseStatus === "live" && (
              <span className="live-pill"><span className="live-dot" /> LIVE</span>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="incident-list">
        {filtered.length === 0 && !error && (
          <div className="empty-state">
            <span className="empty-icon">🛡️</span>
            No incidents match the current filters.
          </div>
        )}
        {filtered.map(inc => {
          const isOpen = expanded === inc.incident_id;
          return (
            <div key={inc.incident_id}
              className={`incident-card ${inc.severity}`}
              onClick={() => setExpanded(isOpen ? null : inc.incident_id)}>
              <div className="incident-top">
                <div className="incident-meta">
                  <SeverityBadge s={inc.severity} />
                  <StatusBadge s={inc.status} />
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "monospace" }}>{inc.incident_id}</span>
                </div>
                <span className="incident-time">{ago(inc.updated_at)}</span>
              </div>
              <div className="incident-clone">
                <span className="lbl">Clone:</span>
                <code>{inc.suspected_clone}</code>
              </div>
              {inc.protected_site && (
                <div className="incident-clone">
                  <span className="lbl">Protected:</span>
                  <code>{inc.protected_site}</code>
                </div>
              )}
              <div className="source-row">
                <span className={`source-pill ${inc.phisfence ? "active" : ""}`}>🛡 PhisFence</span>
                <span className={`source-pill ${inc.phishshield ? "active" : ""}`}>🔍 PhishShield</span>
              </div>

              {isOpen && (
                <div className="incident-detail" onClick={e => e.stopPropagation()}>
                  <div className="detail-block">
                    <h4>PhisFence Evidence</h4>
                    {inc.phisfence ? (
                      <pre>{JSON.stringify(inc.phisfence.evidence || inc.phisfence, null, 2)}</pre>
                    ) : (
                      <p style={{ color: "var(--text-3)", fontSize: 12 }}>No PhisFence event yet</p>
                    )}
                  </div>
                  <div className="detail-block">
                    <h4>PhishShield Result</h4>
                    {inc.phishshield ? (
                      <div className="detail-kv">
                        {[
                          ["Classification", inc.phishshield.classification],
                          ["Risk Score", `${(inc.phishshield.risk_score ?? 0).toFixed(1)} / 100`],
                          ["Confidence", `${((inc.phishshield.confidence ?? 0) * 100).toFixed(1)}%`],
                          ["Domain", inc.phishshield.domain],
                        ].map(([k, v]) => (
                          <div className="detail-kv-row" key={k}>
                            <span className="detail-kv-key">{k}</span>
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-3)", fontSize: 12 }}>No PhishShield scan yet</p>
                    )}
                  </div>
                  <div className="detail-actions" style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: 12, color: "var(--text-2)", alignSelf: "center" }}>Triage:</span>
                    {STATUS_CYCLE.filter(s => s !== inc.status).map(st => (
                      <button key={st} className="btn btn-ghost"
                        style={{ fontSize: 12 }}
                        onClick={() => updateStatus(inc.incident_id, st)}>
                        → {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
