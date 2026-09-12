const INTEGRATION_URL = import.meta.env.VITE_INTEGRATION_URL || "http://localhost:8001";
const PHISHSHIELD_URL = import.meta.env.VITE_PHISHSHIELD_URL || "http://localhost:8000";
const PHISFENCE_URL = import.meta.env.VITE_PHISFENCE_URL || "http://localhost:5000";

export async function fetchIncidents() {
  const r = await fetch(`${INTEGRATION_URL}/incidents`);
  return r.json();
}

export async function scanUrl(url) {
  const r = await fetch(`${PHISHSHIELD_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return r.json();
}

export async function updateIncidentStatus(incidentId, status) {
  const r = await fetch(`${INTEGRATION_URL}/incidents/${encodeURIComponent(incidentId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return r.json();
}
