# 86,400

AI Action Companion prototype. The frontend stays a zero-build single-file PWA in `index.html`; Pace runs through two zero-dependency Vercel Functions.

## Local preview

- UI only: serve the repository root at `http://localhost:8080/`.
- Complete AI flow: use Vercel Dev with `OPENAI_API_KEY` in an uncommitted local environment file.
- Server tests: `node --test test/*.test.js`.

The browser calls same-origin endpoints:

- `POST /api/plan`
- `POST /api/next-action`

## Vercel deployment

1. Import this Git repository into Vercel with the repository root as the project root.
2. Leave Framework Preset as `Other`; no build command or output directory is required.
3. In Project Settings → Environment Variables, add `OPENAI_API_KEY` for Production and Preview.
4. Optionally add `OPENAI_MODEL`; it defaults to `gpt-5-mini`.
5. Deploy, then test onboarding from the generated HTTPS URL.

Never prefix the API key with `VITE_`, `NEXT_PUBLIC_`, or any other browser-exposed name. Saved prototype progress remains in local `localStorage` under `86400.v1`.
