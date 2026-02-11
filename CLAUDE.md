# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

re-imagined.me is a career development web application built with React 18 + TypeScript + Vite + Tailwind CSS + Supabase. It provides a multi-step career assessment, generates personalized career roadmaps, and includes an authenticated portal for managing impact inventories, CV versions, networking, job applications, and more.

## Commands

```bash
npm run dev         # Start Vite dev server (http://localhost:5173)
npm run build       # Production build (outputs to dist/)
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type checking (tsc --noEmit -p tsconfig.app.json)
```

No test runner is configured in package.json. Test files (`*.test.ts`) exist in `src/lib/` using Vitest-style syntax but there is no `vitest` dependency or test script.

## Architecture

### Tech Stack
- **React 18.3** with React Router v7 for client-side SPA routing
- **TypeScript** in strict mode (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- **Vite 5.4** as build tool (`lucide-react` excluded from optimizeDeps)
- **Tailwind CSS 3.4** for styling (utility-first, no custom theme extensions)
- **Supabase** for auth (email/password) and database

### State Management
- **AuthContext** (`src/context/AuthContext.tsx`) — provides `useAuth()` hook for user/session/signOut
- **ReportLayout** (`src/components/report/ReportLayout.tsx`) — context for report data loading/caching, wraps all portal routes
- Component-local state with `useState`; localStorage for offline draft persistence (e.g., Impact Inventory)

### Routing Structure
Routes are defined in `src/App.tsx`:
- **Public routes** wrapped in `Layout` — Home (`/`), Login, Signup, SampleReport, Privacy, etc.
- **Portal routes** wrapped in `ProtectedRoute > PortalLayout > ReportLayout` — all under `/portal/*`
  - `/portal/report/roles-skills|plan|resources` — career report sections
  - `/portal/inventory|cv|radar|applications|networking|progress|profile` — portal tools
- Legacy shortcut routes (`/report/:section`, `/inventory`, `/cv`, etc.) redirect to `/portal/*`

### Source Layout
- `src/pages/` — page components, 1:1 with routes. Portal pages under `src/pages/portal/`
- `src/components/` — reusable components. Report components under `src/components/report/`
- `src/lib/` — business logic, API modules (`*Api.ts`), generators, utilities, and test files
- `src/types/` — TypeScript interfaces organized by domain (assessment, report, applications, etc.)
- `src/context/` — React Context providers (currently only AuthContext)
- `src/data/` — static data (job titles fallback list)

### API Layer Pattern
Each domain has a dedicated `src/lib/*Api.ts` file with functions that take `userId`, call `getSupabaseClient()`, and return typed results. The Supabase client is a lazy-initialized singleton in `src/lib/supabaseClient.ts`.

### Environment Variables
Requires a `.env` file (gitignored) with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Accessed via `import.meta.env.VITE_*`.

## Conventions

- **Components/Pages**: PascalCase `.tsx` files
- **Utilities/API/Types**: camelCase `.ts` files
- **Styling**: Tailwind utilities inline; primary color is `emerald-*`, neutrals are `slate-*`
- **Icons**: `lucide-react` exclusively
- **Auth guard**: `ProtectedRoute` checks `useAuth()`, redirects to `/login` if unauthenticated
- **Git branches**: feature branches use `codex/*` prefix
