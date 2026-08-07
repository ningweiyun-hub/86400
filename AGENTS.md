# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single-file, zero-dependency** time-awareness PWA. Product code is `index.html` (+ `sw.js` for offline cache). Do not introduce npm, frameworks, bundlers, or a backend — see `CLAUDE.md` / `.cursorrules`.

### Run

Serve the repo root over HTTP so the service worker can register (prefer `http://`, not `file://`):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`. Optional pressure-stage preview: `index.html?preview=23:40`.

Design references live under `design_handoff/` (not production code). They may reference missing assets (`support.js`, `_ds/…`); treat them as visual/spec handoff only.

### Lint / test / build

There is no package manager, linter config, test suite, or build step. Validate by opening the app in a browser: console should be clean, and data must survive refresh via `localStorage` key `86400.v1`.

### Open Design

[Open Design](https://open-design.ai) is a separate local-first desktop app (not an official Cursor product). This Cloud Agent VM cannot reach a user’s Open Design daemon. To wire it into Cursor Desktop: install Open Design → choose Cursor as agent → authenticate → use the app’s Settings → MCP server snippet (or `od mcp install cursor` from the Open Design CLI, not `/usr/bin/od`). Repo `.dc.html` files are design-canvas HTML handoffs; they are not an automatic Open Design connection.
