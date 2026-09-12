import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import pino from 'pino';

// ── Config ─────────────────────────────────────────────────────────────────
const PORT           = parseInt(process.env.PHISFENCE_PORT  || process.env.PORT || '5000', 10);
const INTEGRATION_URL = process.env.INTEGRATION_URL || 'http://localhost:8001';
const PROTECTED_SITE  = process.env.PROTECTED_SITE  || null;
const API_KEY         = process.env.API_KEY         || 'phishdefense-dev-key-change-in-prod';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Logger ─────────────────────────────────────────────────────────────────
const log = pino({ level: 'info' });

// ── Circuit breaker ────────────────────────────────────────────────────────
let _cbFailures   = 0;
let _cbOpenUntil  = 0;
const CB_THRESHOLD = 5;
const CB_RESET_MS  = 30_000;

async function _postWithRetry(url, body, retries = [1000, 2000, 4000]) {
  for (const delay of retries) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body,
      });
      if (res.ok) { _cbFailures = 0; return; }
    } catch { /* ignore, retry */ }
    await new Promise(r => setTimeout(r, delay));
  }
  _cbFailures++;
  if (_cbFailures >= CB_THRESHOLD) {
    _cbOpenUntil = Date.now() + CB_RESET_MS;
    log.warn({ event: 'circuit_open', until: new Date(_cbOpenUntil).toISOString() }, 'Integration circuit breaker OPEN');
    _cbFailures = 0;
  }
}

function notifyIntegration(detection) {
  if (typeof fetch !== 'function') return;
  if (Date.now() < _cbOpenUntil) return; // circuit open
  const payload = JSON.stringify({
    source: 'phisfence',
    event_type: 'bait_hit',
    protected_site: PROTECTED_SITE,
    suspected_clone: detection.referer || detection.domainClaim || 'unknown',
    timestamp: detection.time,
    evidence: detection,
    confidence: 0.8,
  });
  _postWithRetry(`${INTEGRATION_URL}/event/phisfence`, payload).catch(() => {});
}

// ── Express + Socket.io ───────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let detections = [];
let blacklist   = [];

// SSE subscribers for blacklist
let _blSubscribers = [];
function _pushBlacklist() {
  const data = JSON.stringify(blacklist);
  _blSubscribers = _blSubscribers.filter(res => {
    try { res.write(`data: ${data}\n\n`); return true; }
    catch { return false; }
  });
}

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/bait.png', (req, res) => {
  const detection = {
    id: uuidv4(),
    referer:    req.get('referer') || req.get('origin') || 'unknown',
    hostHeader: req.get('host')   || 'unknown',
    ip: req.ip,
    ua: req.get('user-agent') || '',
    time: new Date().toISOString(),
  };
  detections.unshift(detection);
  io.emit('new-detection', detection);
  notifyIntegration(detection);
  log.info({ event: 'bait_hit', id: detection.id, referer: detection.referer }, 'Bait hit');
  res.sendFile(path.join(__dirname, 'bait.png'));
});

app.post('/telemetry', (req, res) => {
  const payload = req.body || {};
  const detection = {
    id: uuidv4(),
    referer:     payload.referer || req.get('referer') || 'unknown',
    domainClaim: payload.domain  || 'unknown',
    ip: req.ip,
    ua: req.get('user-agent') || '',
    time: new Date().toISOString(),
    extra: payload,
  };
  detections.unshift(detection);
  io.emit('new-detection', detection);
  notifyIntegration(detection);
  log.info({ event: 'telemetry', id: detection.id, domain: detection.domainClaim }, 'Telemetry received');
  res.json({ ok: true });
});

app.get('/detections', (req, res) => res.json(detections.slice(0, 200)));

app.get('/blacklist.json', (req, res) => res.json(blacklist));

// SSE endpoint — push blacklist updates instantly to protect-lib clients
app.get('/blacklist/stream', (req, res) => {
  res.set({
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  // Send current state immediately
  res.write(`data: ${JSON.stringify(blacklist)}\n\n`);
  _blSubscribers.push(res);
  req.on('close', () => {
    _blSubscribers = _blSubscribers.filter(r => r !== res);
  });
});

app.post('/blacklist', (req, res) => {
  const domain = req.body?.domain;
  if (!domain) return res.status(400).json({ error: 'domain required' });
  if (!blacklist.includes(domain)) {
    blacklist.push(domain);
    io.emit('blacklist-updated', blacklist);
    _pushBlacklist();
    log.info({ event: 'blacklist_add', domain }, 'Domain blacklisted');
  }
  res.json({ ok: true, blacklist });
});

app.delete('/blacklist/:domain', (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  blacklist = blacklist.filter(d => d !== domain);
  io.emit('blacklist-updated', blacklist);
  _pushBlacklist();
  log.info({ event: 'blacklist_remove', domain }, 'Domain removed from blacklist');
  res.json({ ok: true, blacklist });
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'monitor-api', version: '2.0' }));

// ── Start ─────────────────────────────────────────────────────────────────
server.listen(PORT, () => log.info({ event: 'start', port: PORT }, `Monitor API running on port ${PORT}`));
