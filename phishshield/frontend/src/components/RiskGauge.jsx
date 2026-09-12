export default function RiskGauge({ score }) {
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="gauge-wrap" aria-label={`Risk score ${score} out of 100`}>
      <div className="gauge">
        <div className="gauge-mask" />
        <div className="gauge-tick tick-low" />
        <div className="gauge-tick tick-mid" />
        <div className="gauge-tick tick-high" />
        <div
          className="needle"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        />
        <div className="gauge-center">
          <strong>{score}</strong>
          <span>risk score</span>
        </div>
      </div>

      <div className="gauge-scale">
        <span>Clean</span>
        <span>Hostile</span>
      </div>
    </div>
  );
}
