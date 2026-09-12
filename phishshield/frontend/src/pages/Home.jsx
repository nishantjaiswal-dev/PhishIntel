import { useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";
import UrlInput from "../components/UrlInput";
import VerdictCard from "../components/VerdictCard";
import AdvancedDetails from "../components/AdvancedDetails";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advanced, setAdvanced] = useState(false);

  const scanURL = async (url) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setAdvanced(false);

      const response = await api.post("/scan", { url });

      setResult(response.data);
    } catch {
      setError("Failed to scan URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="cyber-bg" aria-hidden="true">
        <div className="grid-layer" />
        <div className="scan-beam beam-one" />
        <div className="scan-beam beam-two" />
        <span className="data-node node-one" />
        <span className="data-node node-two" />
        <span className="data-node node-three" />
      </div>

      <div className="container">
        <Navbar />

        <section className="control-panel" aria-label="URL scanner">
          <div className="panel-topline">
            <span>Live threat check</span>
            <span className="signal-dot" aria-hidden="true" />
          </div>

          <UrlInput onScan={scanURL} />

          <div className="metric-row" aria-label="Scanner highlights">
            <div>
              <strong>Realtime</strong>
              <span>URL analysis</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Risk scoring</span>
            </div>
            <div>
              <strong>Deep</strong>
              <span>Signal review</span>
            </div>
          </div>
        </section>

        <section className="results-zone" aria-live="polite">
          {loading && <LoadingSpinner />}

          {error && <ErrorMessage message={error} />}

          {result && (
            <>
              <VerdictCard result={result} />

              <button
                className="details-btn"
                onClick={() => setAdvanced(!advanced)}
                type="button"
              >
                <span>{advanced ? "Hide details" : "Show details"}</span>
                <span className="details-icon" aria-hidden="true">
                  {advanced ? "-" : "+"}
                </span>
              </button>

              {advanced && <AdvancedDetails result={result} />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
