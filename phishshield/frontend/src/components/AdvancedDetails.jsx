export default function AdvancedDetails({ result }) {
  return (
    <div className="card details-card">
      <div className="details-section">
        <h3>Reasons</h3>
        <ul>
          {result.reasons.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h3>Recommendations</h3>
        <ul>
          {result.recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
