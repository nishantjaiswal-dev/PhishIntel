// PhishFence protect-lib v2
// Defends legitimate sites by detecting unauthorized clones.
// Changes from v1:
//  - Blacklist enforcement via SSE (instant push) instead of polling
//  - Falls back to polling if EventSource is unavailable
//  - All config externalized (no hardcoded localhost fallback in prod)
(function () {
  const OFFICIAL_DOMAINS = (typeof PROTECT_OFFICIAL_DOMAINS !== 'undefined')
    ? PROTECT_OFFICIAL_DOMAINS
    : ['demo.local', 'localhost', '127.0.0.1'];
  const MONITOR_API = (typeof PROTECT_MONITOR_URL !== 'undefined')
    ? PROTECT_MONITOR_URL
    : 'http://localhost:5000';
  const LIB_KEY = 'pf-' + (btoa(window.location.origin || window.location.hostname || 'unknown')).replace(/=/g, '');

  // ── Overlay ──────────────────────────────────────────────────────────────
  function showBlockOverlay(msg) {
    try {
      if (document.getElementById('__pf_overlay')) return;
      const ov = document.createElement('div');
      ov.id = '__pf_overlay';
      Object.assign(ov.style, {
        position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.92)',
        color: '#fff', zIndex: '2147483647', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, Arial', textAlign: 'center', padding: '24px',
      });
      ov.innerHTML = `<div style="max-width:520px">
        <h1 style="margin:0 0 16px;font-size:28px">⚠ PhishFence: Site Blocked</h1>
        <p style="margin:0 0 12px">${msg || 'This page is not authorized.'}</p>
        <p style="margin:14px 0 0;color:#ddd;font-size:13px">If this is a mistake, contact site support.</p>
      </div>`;
      document.documentElement.style.pointerEvents = 'none';
      ov.style.pointerEvents = 'auto';
      document.body.appendChild(ov);
    } catch (e) { console.warn('[pf] overlay err', e); }
  }

  // ── Domain check ─────────────────────────────────────────────────────────
  function domainAllowed() {
    try {
      return OFFICIAL_DOMAINS.includes(window.location.hostname.toLowerCase());
    } catch { return false; }
  }

  // ── Bait beacon ───────────────────────────────────────────────────────────
  function sendBaitBeacon(extra = {}) {
    try {
      const img = new Image();
      img.src = `${MONITOR_API}/bait.png?ts=${Date.now()}&k=${encodeURIComponent(LIB_KEY)}&r=${encodeURIComponent(location.href)}`;
      img.style.display = 'none';
      document.documentElement.appendChild(img);
      fetch(`${MONITOR_API}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: LIB_KEY, domain: location.hostname, ts: Date.now(), extra }),
        keepalive: true,
      }).catch(() => {});
    } catch { }
  }

  // ── Blacklist enforcement ─────────────────────────────────────────────────
  function checkAndEnforce(list) {
    try {
      if (Array.isArray(list) && list.includes(window.location.hostname)) {
        showBlockOverlay('This domain has been flagged as a phishing clone. Interactions are disabled.');
      }
    } catch { }
  }

  function listenBlacklist() {
    // Prefer SSE (instant push from monitor-api /blacklist/stream)
    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(`${MONITOR_API}/blacklist/stream`);
      es.onmessage = (e) => {
        try { checkAndEnforce(JSON.parse(e.data)); } catch { }
      };
      es.onerror = () => {
        // SSE failed — fall back to polling
        es.close();
        pollBlacklist();
      };
    } else {
      pollBlacklist();
    }
  }

  function pollBlacklist() {
    async function doPoll() {
      try {
        const r = await fetch(`${MONITOR_API}/blacklist.json`, { cache: 'no-store' });
        if (r.ok) checkAndEnforce(await r.json());
      } catch { }
    }
    doPoll();
    setInterval(doPoll, 15_000);
  }

  // ── Integrity check ───────────────────────────────────────────────────────
  function integrityCheck() {
    try {
      const recomputed = 'pf-' + (btoa(window.location.origin || window.location.hostname)).replace(/=/g, '');
      if (recomputed !== LIB_KEY) {
        sendBaitBeacon({ reason: 'integrity_mismatch' });
        showBlockOverlay('PhishFence integrity check failed.');
        return false;
      }
      return true;
    } catch { return false; }
  }

  // ── Delayed detonation ────────────────────────────────────────────────────
  function scheduleDelayedDetonation() {
    const delay = 60_000 + Math.floor(Math.random() * 120_000);
    setTimeout(() => {
      if (!domainAllowed()) {
        sendBaitBeacon({ reason: 'delayed_detonation' });
        showBlockOverlay('This copy has been automatically blocked by PhishFence.');
      }
    }, delay);
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  (function start() {
    if (!integrityCheck()) return;

    if (!domainAllowed()) {
      sendBaitBeacon({ reason: 'domain_mismatch' });
      showBlockOverlay('This domain is not authorized to host this application.');
      scheduleDelayedDetonation();
      return;
    }

    // Legitimate domain: place bait beacon (detects hotlinking from clones)
    sendBaitBeacon({ reason: 'boot_ok' });
    // Subscribe to blacklist via SSE (or fallback to polling)
    listenBlacklist();
  })();

  // Debug hook (safe for developers)
  try { window.__phishfence_debug = { sendBaitBeacon, domainAllowed }; } catch { }
})();
