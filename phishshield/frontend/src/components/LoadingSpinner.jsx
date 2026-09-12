export default function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner" aria-hidden="true"></div>
      <p>Scanning URL...</p>
    </div>
  );
}
