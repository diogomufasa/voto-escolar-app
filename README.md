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

## 🗄️ Supabase workflow

- Track schema changes with SQL migrations in `supabase/migrations/`.
- Use Supabase CLI to apply migrations and deploy Edge Functions:

	```powershell
	supabase login
	supabase db push --project-ref <STAGING_REF>
	supabase functions deploy create-user --project-ref <STAGING_REF>
	```

- Always test on a staging project before touching production and back up your database first.

Happy shipping! :rocket:

