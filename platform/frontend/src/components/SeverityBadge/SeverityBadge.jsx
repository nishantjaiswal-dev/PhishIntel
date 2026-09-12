import React from "react";

const MAP = {
  CRITICAL: "badge-critical",
  HIGH: "badge-high",
  MEDIUM: "badge-medium",
  LOW: "badge-low",
};

export default function SeverityBadge({ severity }) {
  const cls = MAP[severity] || "badge-low";
  return <span className={`badge ${cls}`}>{severity}</span>;
}
