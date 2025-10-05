# VotoEscolar (aka SchoolVote)



## 🔧 Stack

- Vite + React 18 + TypeScript 5
- Tailwind CSS 3 + shadcn-ui (Radix primitives)
- TanStack Query for data fetching
- Supabase (PostgreSQL, Auth, Edge Functions)

## ✅ Prerequisites

- Node.js 20.x (recommend using [nvm-windows](https://github.com/coreybutler/nvm-windows) or Volta)
- npm 10.x (installed with Node)
- (Optional) [Supabase CLI](https://supabase.com/docs/guides/cli) for database migrations & edge function deploys

## 🚀 Getting started (development)

```powershell
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install

Copy-Item .env.example .env
# Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

npm run dev
```

The dev server runs on http://localhost:5173 by default.

## 🔐 Environment variables

All runtime configuration lives in `.env` (never commit populated env files):

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL from Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Keep sensitive keys (service role, JWT secrets) on the server only—never expose them in the frontend.

## 📦 npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with hot module reload |
| `npm run build` | Produce production bundle in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## 🧪 Quality gates

Run these before every merge/release:

```powershell
npm install
npm run lint
npm run build
```

Add tests under `src/` (e.g., Vitest, React Testing Library) and wire them into CI as the codebase grows.

## 🗄️ Supabase workflow

- Track schema changes with SQL migrations in `supabase/migrations/`.
- Use Supabase CLI to apply migrations and deploy Edge Functions:

	```powershell
	supabase login
	supabase db push --project-ref <STAGING_REF>
	supabase functions deploy create-user --project-ref <STAGING_REF>
	```

- Always test on a staging project before touching production and back up your database first.

## 🚢 Production build & deploy

1. Ensure `.env` contains production values (URL + anon key).
2. Run `npm run lint` and `npm run build` locally; confirm output in `dist/` with `npm run preview`.
3. Upload the `dist/` folder to your hosting provider (Vercel/Netlify/Cloudflare Pages/Supabase Storage) or configure CI to deploy automatically.
4. Configure environment variables in your hosting dashboard (same keys as `.env`).
5. If using Supabase for auth/storage, verify RLS policies, OAuth providers, and redirect URLs match production domain(s).

## 🛡️ Production readiness checklist

- [ ] `.env` populated with production credentials and excluded from git
- [ ] Supabase migrations applied & functions deployed (staging → prod)
- [ ] ESLint + build succeed (no type or bundling errors)
- [ ] Dependency audit (`npm audit`) reviewed; critical issues resolved
- [ ] App smoke-tested end-to-end (auth, voting flows, dashboards)
- [ ] Monitoring/analytics configured (Sentry, LogRocket, Supabase logs, etc.)
- [ ] Backups scheduled for Supabase database
- [ ] Hosting configured with HTTPS, caching, and appropriate headers (CSP, HSTS)

## 🧭 Next steps

- Set up a CI workflow to run lint/build on every pull request (see `.github/workflows/ci.yml` once added).
- Add automated tests covering the most critical flows.
- Consider bundle analysis & lazy loading for large components (charts, tables).

Happy shipping! :rocket:

