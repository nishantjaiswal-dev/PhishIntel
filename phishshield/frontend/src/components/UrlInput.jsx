import { useState } from "react";

export default function UrlInput({ onScan }) {
  const [url, setUrl] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!url.trim()) return;

    onScan(url);
  };

  return (
    <form onSubmit={submit} className="scan-form">
      <div className="input-shell">
        <span className="input-prefix" aria-hidden="true">
          //
        </span>
        <input
          type="text"
          placeholder="Paste suspicious URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="URL to scan"
        />
      </div>

      <button type="submit">
        <span>Analyze</span>
        <span aria-hidden="true">{"->"}</span>
      </button>
    </form>
  );
}
