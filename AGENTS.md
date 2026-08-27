# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single-file, zero-dependency frontend** with small, zero-dependency Vercel Functions. Frontend product code remains `index.html` (+ `sw.js` for offline cache). Do not introduce npm, frameworks, or bundlers. Server-only AI endpoints may live in `api/`, with shared server code in `server/`; never expose secrets to `index.html` — see `CLAUDE.md` / `.cursorrules`.

### Run

For UI-only work, serve the repo root over HTTP so the service worker can register (prefer `http://`, not `file://`):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`. Optional pressure-stage preview: `index.html?preview=23:40`.

For the complete app including `/api/plan` and `/api/next-action`, use Vercel's local development server and provide `OPENAI_API_KEY` only through a local environment file or Vercel Project Settings. Never commit a real key.

Design references live under `design_handoff/` (not production code). They may reference missing assets (`support.js`, `_ds/…`); treat them as visual/spec handoff only.

### Lint / test / build

There is no package manager, linter config, or build step. Server tests use Node's built-in test runner. Validate the server with `node --test test/*.test.js`, then open the app in a browser: console should be clean, and data must survive refresh via `localStorage` key `86400.v1`.

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

### Branches

`archive/DO-NOT-MERGE-*` branches are kept for reference only — **never merge them into `main`**.
They were built on an older base and their changes have already been re-applied on top of current
`main` in a separate PR. Merging one will conflict badly and can regress `sw.js` cache versions.

This repo is worked on by several agents in parallel (Cursor Cloud, Claude Code). Always
`git fetch` and branch from the latest `origin/main` before starting; a local `main` can be many
commits behind without any local sign of it.
