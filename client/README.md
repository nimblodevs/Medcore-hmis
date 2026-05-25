# MediCore HMIS Client

Frontend web application for MediCore HMIS, built with React, Vite, Tailwind CSS, shadcn-style UI primitives, React Router, React Query, Axios, Zustand, React Hook Form, and Zod.

## Requirements

- Node.js 20 or newer recommended
- npm
- Running MediCore backend API, usually at `http://localhost:4000/api`

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Set the backend API URL:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

`GEMINI_API_KEY` and `APP_URL` are included for AI Studio style deployments. They are not required for normal local HMIS screens unless a feature explicitly uses Gemini.

## Scripts

Run the development server:

```bash
npm run dev
```

The Vite server is configured in `vite.config.js` to run on port `5000` and bind to `0.0.0.0`.

Build for production:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview a production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  App.jsx                         App providers and router shell
  main.jsx                        React entry point
  index.css                       Tailwind CSS entry
  components/
    layout/                       Navbar, Sidebar, page layout helpers
    ui/                           shadcn-style reusable UI primitives
    ProtectedRoute.jsx            Auth and role-gated route wrapper
  features/
    appointment-management/       Appointment pages, hooks, API, schemas
    auth/                         Login/profile auth flow
    cash/                         Cash counters, sessions, cashiers
    cash-management/              Cash route bridge
    departments/                  Department API/hooks/components
    emr/                          EMR workspace and clinical forms
    invoice-management/           Invoice pages, hooks, API, schemas
    pharmacy/                     Pharmacy dashboard and module routes
    users/                        User management pages, hooks, API
  pages/
    HMS.jsx                       Main authenticated app shell
    Finance/                      Finance pages
    Patient/                      Patient pages
  services/
    apiClient.js                  Shared Axios client
  store/
    authStore.js                  Zustand auth persistence
```

## Routing

The main route shell lives in `src/pages/HMS.jsx`.

Current top-level routes include:

- `/auth/*`
- `/admin/users/*`
- `/appointments/*`
- `/cash-management/*`
- `/invoice-management/*`
- `/patients/*`
- `/finance/*`
- `/pharmacy/*`

Protected modules use `src/components/ProtectedRoute.jsx`, which redirects unauthenticated users to `/auth/login`.

## Backend Integration

All Axios calls should use `src/services/apiClient.js`.

The client reads `VITE_API_BASE_URL`, defaulting to:

```text
http://localhost:4000/api
```

The API client automatically attaches `Authorization: Bearer <token>` from `localStorage.accessToken` and attempts token refresh through `/auth/refresh-token`.

Prefer importing the shared client with the alias:

```js
import apiClient from "@/services/apiClient";
```

Feature API modules may use route constants like `/api/appointments` or `/appointments`; the shared client normalizes duplicate `/api` prefixes.

## UI Conventions

- Reusable UI primitives live in `src/components/ui`.
- Components support shadcn-style named imports, for example `import { Button } from "@/components/ui/button"`.
- Several primitives also expose default exports for compatibility with older screens.
- Icons come from `lucide-react`.
- Styling uses Tailwind CSS v4 through `@tailwindcss/vite`.

## Verification

Before handing off client changes, run:

```bash
npm run build
npm run lint
```

Current lint may report React Compiler warnings for React Hook Form `watch()` usage. These warnings do not fail lint, but they are worth revisiting when refactoring those forms.
