import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./styles.css";
import IncidentTab from "./IncidentTab";
import ScannerTab from "./ScannerTab";
import BlacklistTab from "./BlacklistTab";

const MONITOR_URL = import.meta.env.VITE_PHISFENCE_URL || "http://localhost:5000";

const TABS = [
  { id: "detections", label: "Live Detections", icon: "📡" },
  { id: "scanner",    label: "URL Scanner",      icon: "🔍" },
  { id: "incidents",  label: "Incidents",         icon: "🚨" },
  { id: "blacklist",  label: "Blacklist",          icon: "🚫" },
];

function ago(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function extractHost(ref) {
  try { return new URL(ref).hostname; } catch { return null; }
}

export default function App() {
  const [tab, setTab]           = useState("detections");
  const [detections, setDetections] = useState([]);
  const [blacklist, setBlacklist]   = useState([]);
  const [incidentNew, setIncidentNew] = useState(0);
  const [socketStatus, setSocketStatus] = useState("connecting");

  // Load initial data + socket
  useEffect(() => {
    fetch(`${MONITOR_URL}/detections`).then(r => r.json()).then(setDetections).catch(() => {});
    fetch(`${MONITOR_URL}/blacklist.json`).then(r => r.json()).then(setBlacklist).catch(() => {});

    const socket = io(MONITOR_URL, { reconnection: true });
    socket.on("connect",           () => setSocketStatus("live"));
    socket.on("disconnect",        () => setSocketStatus("disconnected"));
    socket.on("new-detection",     d  => setDetections(prev => [d, ...prev].slice(0, 200)));
    socket.on("blacklist-updated", bl => setBlacklist(bl));
    return () => socket.disconnect();
  }, []);

  const refreshBlacklist = () =>
    fetch(`${MONITOR_URL}/blacklist.json`).then(r => r.json()).then(setBlacklist).catch(() => {});

  const doBlacklist = async (domain) => {
    if (!domain) return;
    await fetch(`${MONITOR_URL}/blacklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    }).catch(() => {});
    refreshBlacklist();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">🛡️</div>
          PhishDefense SOC
        </div>
        <div className="app-status">
          <span className={socketStatus === "live" ? "status-dot" : "status-dot"} 
            style={socketStatus !== "live" ? { background: "var(--red)", boxShadow: "0 0 6px var(--red)" } : {}} />
          PhisFence: {socketStatus === "live" ? "Connected" : "Reconnecting…"}
        </div>
      </header>

      {/* Tab nav */}
      <nav className="tab-nav">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
            {t.id === "detections" && detections.length > 0 && (
              <span className="tab-badge">{detections.length > 99 ? "99+" : detections.length}</span>
            )}
            {t.id === "incidents" && incidentNew > 0 && (
              <span className="tab-badge red">{incidentNew}</span>
            )}
            {t.id === "blacklist" && blacklist.length > 0 && (
              <span className="tab-badge">{blacklist.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="tab-content">
        {/* ── Tab 1: Live Detections ── */}
        {tab === "detections" && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Detections</div>
                <div className="stat-value">{detections.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Unique Referers</div>
                <div className="stat-value purple">
                  {new Set(detections.map(d => extractHost(d.referer)).filter(Boolean)).size}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Blacklisted</div>
                <div className="stat-value orange">{blacklist.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Stream</div>
                <div className="stat-value green">{socketStatus === "live" ? "Live" : "—"}</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title" style={{ justifyContent: "space-between" }}>
                <span>Bait Hits <span className="count">({detections.length})</span></span>
                {socketStatus === "live" && <span className="live-pill"><span className="live-dot" /> Live</span>}
              </div>
              {detections.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📡</span>
                  Waiting for bait hits. Bait assets will trigger detections when accessed from clone sites.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Referer / Clone Domain</th>
                      <th>IP</th>
                      <th>User Agent</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detections.map(d => (
                      <tr key={d.id}>
                        <td className="cell-muted">{ago(d.time)}</td>
                        <td className="cell-truncate">
                          <span className="cell-mono">{d.referer}</span>
                        </td>
                        <td className="cell-mono">{d.ip}</td>
                        <td className="cell-truncate cell-muted">{d.ua}</td>
                        <td>
                          <button className="btn btn-danger"
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            onClick={() => doBlacklist(extractHost(d.referer) || d.referer)}>
                            Block
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Tab 2: Scanner ── */}
        {tab === "scanner" && <ScannerTab />}

        {/* ── Tab 3: Incidents ── */}
        {tab === "incidents" && <IncidentTab onCountChange={setIncidentNew} />}

        {/* ── Tab 4: Blacklist ── */}
        {tab === "blacklist" && (
          <BlacklistTab blacklist={blacklist} onRefresh={refreshBlacklist} />
        )}
      </main>
    </div>
  );
}
