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

### Open Design ↔ Cursor Local CLI

[Open Design](https://open-design.ai) drives design via a **local** coding-agent CLI. For Cursor that means the Cursor Agent CLI (`agent` / `cursor-agent`), not a Cloud Agent session.

On the **same machine** that runs Open Design Desktop:

```bash
curl https://cursor.com/install -fsS | bash
export PATH="$HOME/.local/bin:$PATH"
agent login          # or: cursor-agent login
agent status         # must show authenticated
```

Then in Open Design: Settings → select **Cursor** as agent (**Local CLI**). Open Design spawns `cursor-agent`; if status is unauthenticated you’ll see `AGENT_AUTH_REQUIRED` / “run `cursor-agent login`…”. Optional MCP wiring into Cursor Desktop: `od mcp install cursor` (Open Design’s `od`, not `/usr/bin/od`).

Repo `design_handoff/*.dc.html` files are design-canvas HTML handoffs only — they do not auto-connect Open Design.
