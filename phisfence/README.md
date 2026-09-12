# PhishFence - Hackathon Prototype

## What this is
PhishFence is a prototype that combines a client-side protection library with a bait/monitoring backend and a dashboard for real-time phishing clone detection and mitigation.

## Quick start (local)
Assumes Node.js installed (v16+ recommended).

1. Start Monitor API
```bash
cd monitor-api
npm install
npm start
```
Monitor runs on http://localhost:5000

2. (Optional) Build protect-lib (obfuscation)
```bash
cd protect-lib
npm install
# optional: npm run build  (requires javascript-obfuscator)
```
If you don't build, demo pages will use `protect-lib/src/index.js`.

3. Serve demo-site and clone-sim pages
Simplest: open `demo-site/index.html` and `clone-sim/index.html` directly in browser (file://) OR run a simple static server:
```bash
# using python
cd demo-site
python3 -m http.server 8000
# then open http://localhost:8000

cd ../clone-sim
python3 -m http.server 7000
# open http://localhost:7000
```

4. Start dashboard
```bash
cd dashboard
npm install
npm run dev
# open the URL printed by Vite (usually http://localhost:5173)
```

## Demo flow
- Open official site (demo-site). It should load normally.
- Open clone site (clone-sim) served from another host/port. The protection library will send bait to monitor-api.
- Dashboard will show detection entry. Click "Blacklist" to add domain to blacklist.
- After blacklisting, the protect-lib (polling blacklist) will display an overlay blocking the site (if the clone loads the library).

## Notes / Next steps
- This is a demo. For production: use TLS, host monitor-api on a hardened server, persist detections in DB, secure endpoints with auth, rotate keys, obfuscate protect-lib and split code.
- Legal: Do not serve harmful payloads to suspected clones. Use neutral informational blocking and proper takedown channels.