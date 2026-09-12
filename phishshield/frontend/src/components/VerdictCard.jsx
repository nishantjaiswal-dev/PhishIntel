import RiskGauge from "./RiskGauge";

export default function VerdictCard({ result }) {
  const verdict = result.risk.verdict;
  const score = result.risk.risk_score;

  let colorClass = "safe";

  if (verdict === "DANGEROUS") {
    colorClass = "danger";
  } else if (verdict === "HIGH RISK") {
    colorClass = "high";
  }

  return (
    <div className={`card verdict-card ${colorClass}`}>
      <div className="verdict-header">
        <div>
          <span className="eyebrow">Detection verdict</span>
          <h2>{verdict}</h2>
        </div>

        <span className="status-pill">
          <span className="status-light" aria-hidden="true" />
          {score}/100
        </span>
      </div>

      <RiskGauge score={score} />

      <p>{result.recommendations[0]}</p>
    </div>
  );
}
