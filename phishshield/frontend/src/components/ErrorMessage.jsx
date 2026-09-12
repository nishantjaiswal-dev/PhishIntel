export default function ErrorMessage({ message }) {
  return (
    <div className="error-card" role="alert">
      <strong>Scan interrupted</strong>
      {message}
    </div>
  );
}
