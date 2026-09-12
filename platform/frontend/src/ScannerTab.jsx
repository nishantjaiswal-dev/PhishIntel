import React, { useState } from "react";

const PHISHSHIELD_URL = import.meta.env.VITE_PHISHSHIELD_URL || "http://localhost:8000";

function getRiskClass(score) {
  if (score <= 20) return "safe";
  if (score <= 40) return "low";
  if (score <= 60) return "moderate";
  if (score <= 80) return "high";
  return "danger";
}

function getRiskColor(score) {
  if (score <= 20) return "#34d399";
  if (score <= 40) return "#86efac";
  if (score <= 60) return "#fbbf24";
  if (score <= 80) return "#fb923c";
  return "#f87171";
}

function Check({ ok, label }) {
  return (
    <div className="verdict-item">
      <div className="verdict-item-label">{label}</div>
      <div className={`verdict-item-value ${ok ? "pass" : "fail"}`}>
        {ok ? "✓ Pass" : "✗ Fail"}
      </div>
    </div>
  );
}

export default function ScannerTab() {
  const [url, setUrl]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [result, setResult] = useState(null);
  const [advanced, setAdvanced] = useState(false);

  const scan = async () => {
    if (!url.trim()) return;
    try {
      setLoading(true); setError(""); setResult(null); setAdvanced(false);
      const resp = await fetch(`${PHISHSHIELD_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setResult(await resp.json());
    } catch (e) {
      setError(`Scan failed: ${e.message}. Is PhishShield running on port 8000?`);
    } finally {
      setLoading(false);
    }
  };

  const risk = result?.risk;
  const score = risk?.risk_score ?? 0;
  const rclass = getRiskClass(score);
  const rcolor = getRiskColor(score);

  return (
    <div className="scanner-wrap">
      {/* Input */}
      <div className="scanner-input-row">
        <input
          className="scanner-input"
          type="url"
          placeholder="Enter URL to scan — e.g. https://suspicious-site.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && scan()}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={scan} disabled={loading || !url.trim()}>
          {loading ? <span className="spinner" /> : "🔍"} Scan
        </button>
      </div>

      {error && <div className="error-bar">⚠ {error}</div>}

      {loading && (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 16, color: "var(--text-2)" }}>Running parallel analyzers…</p>
        </div>
      )}

      {result && (
        <>
          {/* Risk gauge */}
          <div className="panel risk-gauge-wrap">
            <div className={`risk-score-num ${rclass}`}>{score}</div>
            <div className="risk-verdict" style={{ color: rcolor }}>{risk?.verdict}</div>
            <div className="risk-bar-track">
              <div className="risk-bar-fill" style={{ width: `${score}%`, background: rcolor }} />
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>{result.url}</p>
          </div>

          {/* Quick checks */}
          <div className="panel">
            <div className="panel-title">Quick Checks</div>
            <div className="verdict-grid">
              <Check ok={result.ssl?.ssl_valid} label="SSL Valid" />
              <Check ok={!result.openphish?.listed} label="Not in OpenPhish" />
              <Check ok={!result.phishtank?.listed} label="Not in PhishTank" />
              <Check ok={!result.brand_analysis?.impersonation} label="No Brand Impersonation" />
              <Check ok={!result.typosquatting?.possible_typosquatting} label="No Typosquatting" />
              <Check ok={!result.shortened_url?.is_shortened} label="Not Shortened" />
            </div>
          </div>

          {/* AI prediction */}
          {result.ai_prediction && (
            <div className="panel">
              <div className="panel-title">AI Prediction</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className="stat-card" style={{ flex: 1 }}>
                  <div className="stat-label">Label</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>
                    {result.ai_prediction.label || "—"}
                  </div>
                </div>
                <div className="stat-card" style={{ flex: 1 }}>
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>
                    {result.ai_prediction.confidence != null
                      ? `${(result.ai_prediction.confidence * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reasons */}
          {result.reasons?.length > 0 && (
            <div className="panel">
              <div className="panel-title">Risk Signals</div>
              <ul className="reasons-list">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Advanced toggle */}
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 16 }}
            onClick={() => setAdvanced(!advanced)}>
            {advanced ? "Hide" : "Show"} Advanced Details
          </button>

          {advanced && (
            <div className="panel">
              <div className="panel-title">Raw Analysis Data</div>
              <pre style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, fontSize: 12, overflow: "auto", maxHeight: 400 }}>
                {JSON.stringify({
                  whois: result.whois,
                  ssl: result.ssl,
                  redirects: result.redirects,
                  content: result.content,
                  risk_indicators: result.risk_indicators,
                  url_features: result.url_features,
                }, null, 2)}
              </pre>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div className="panel">
              <div className="panel-title">Recommendations</div>
              <ul className="reasons-list" style={{}}>
                {result.recommendations.map((r, i) => <li key={i} style={{ "::before": { content: "✓" } }}>{r}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
