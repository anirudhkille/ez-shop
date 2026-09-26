# EZ Shop — MERN Ecommerce Platform

A full-stack ecommerce application with a customer storefront, a staff admin
dashboard, and an Express/MongoDB API. Covers the full purchase lifecycle:
browse → cart → coupon → checkout (COD or Stripe) → order tracking → invoice
download, plus role-gated store management for staff.

**Live storefront:** [ez-shop.onrender.com](https://ez-shop.onrender.com/)

## Features

### Storefront (`client/`)

- Email/password signup with OTP verification, login, and Google OAuth
- Password reset via emailed single-use token
- Product catalogue with categories, search, filters, and infinite scroll
- Product detail with colour/size variants, live stock, related products
- Cart that works signed-out (persisted locally) and signed-in (server-backed)
- Coupons — percentage or fixed, with per-user claim limits
- Checkout for guests and members, paying by cash on delivery or card (Stripe)
- Order tracking, and a receipt page for both guest and member orders
- Wishlist
- Account area — overview, orders, saved items, settings — with a signed-in
  order detail page and one-click invoice (PDF) download
- Newsletter signup

### Admin (`admin/`)

- Revenue/orders/users/products dashboard with charts
- Product, category and coupon CRUD
- Order management with status transitions, plus invoice download
- Customer detail with lifetime value, recent orders, wishlist and addresses
- Newsletter subscriber list
- Light and dark themes sharing the storefront's brand palette

### API (`server/`)

- JWT access (15 min) + rotating refresh tokens (7 days), tracked in Mongo with
  a TTL index so expired sessions self-clean
- Role-based authorisation (`User` / `Admin`)
- PDF invoice generation, issued at checkout or on demand, scoped to the owner
- Review endpoints
- Zod request validation, rate limiting, Helmet, CORS allow-list, compression
  and structured logging

## Tech stack

| Layer | Stack |
| --- | --- |
| **Storefront** | React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, TanStack Query 5, Zustand, React Hook Form, Zod, Axios, Lucide, Sonner |
| **Admin** | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, next-themes, TanStack Table, Recharts, shadcn-style Radix primitives |
| **API** | Node, Express 5, Mongoose 8, Zod, jsonwebtoken, Passport (Google OAuth), Stripe, PDFKit, Cloudinary, Resend, express-rate-limit, Helmet, Pino |
| **Database** | MongoDB |
| **Shared styling** | CSS-variable design tokens, Barlow Condensed (display) + Outfit (body) |

## Project structure

```
.
├── client/   Vite + React storefront
├── admin/    Next.js admin dashboard
├── server/   Express + MongoDB API
└── readme/   Screenshots used above
```

### Storefront (`client/src`)

Organised by feature rather than by file type. A feature owns its pages,
components, data layer and types, and exposes a public surface through a barrel.

```
src/
├── app/            router + app shell
│   ├── App.tsx         error boundary, suspense
│   ├── routes.tsx      maps paths to page components — wiring only
│   ├── layout.tsx      header + footer + <Outlet/>
│   ├── header.tsx  footer.tsx  not-found.tsx
├── content/        static pages (terms, privacy, cookies) — no logic
├── features/
│   └── <feature>/
│       ├── pages/       page components for this feature
│       ├── components/  feature-specific components
│       ├── hooks/       react-query hooks
│       ├── api/         raw HTTP calls
│       ├── store/       zustand stores (where a feature needs one)
│       ├── types.ts
│       └── index.ts     the only surface other code may import
└── shared/
    ├── components/      used by 2+ features (ui/, container, head, toaster)
    ├── lib/             axios instance, formatters, helpers
    └── types/           types shared across features
```

Rules this layout keeps:

- **Pages live inside their owning feature.** `pages/` only exists where a route
  belongs to exactly one feature.
- **Barrels are the public surface.** Anything not exported from
  `features/<f>/index.ts` is private to that feature, so refactors stay local.
  `knip` enforces this — an export nothing outside the feature imports is
  reported as unused.
- **`shared/` is for code 2+ features actually use.** Nothing is promoted
  pre-emptively; `shared/hooks/` is absent because every hook today is a feature
  data hook.
- **`routes.tsx` wires paths to page components and holds no logic.**

### API (`server/src`)

Each feature lives in its own module under `src/modules/<feature>/` and
follows the same layering:

```
<feature>/
├── <feature>.model.ts        Mongoose schema
├── <feature>.repository.ts   all database access
├── <feature>.service.ts      business logic
├── <feature>.controller.ts   request/response handling
├── <feature>.routes.ts       routing + middleware
└── <feature>.schema.ts       Zod validation
```

**All database access goes through the repository layer** — services, controllers
and middleware never import a model directly. Keeping this boundary means query
projections, lean reads and indexes are changed in one place.

## Getting started

### Prerequisites

- Node.js 24+
- A MongoDB instance (local or hosted)

Each workspace is installed and run independently — the root `package.json` only
holds Husky and lint-staged.

### 1. API

```bash
cd server
npm install
cp .env .env        # then fill in the values below
npm run dev         # tsx watch, http://localhost:8080
```

`server/.env` is validated at boot by a Zod schema, so a missing value fails
fast with a logged reason instead of surfacing later as a runtime error.

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `PORT` | API port (default `8080`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets |
| `SESSION_SECRET` | Express session secret |
| `CLIENT_URL`, `ADMIN_URL` | Frontend origins, allowed by CORS |
| `CORS_ORIGINS` | Extra comma-separated origins, added to `CLIENT_URL` and `ADMIN_URL` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth |
| `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` | Image uploads |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD` | SMTP fallback |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Card payments |

### 2. Storefront

```bash
cd client
npm install
```

`client/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL, e.g. `http://localhost:8080/api` |

```bash
npm run dev
```

### 3. Admin dashboard

```bash
cd admin
npm install
cp .env.example .env
```

`admin/.env`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | API base URL |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud for uploads |
| `NEXT_PUBLIC_UPLOAD_PRESET` | Cloudinary unsigned upload preset |

```bash
npm run dev
```

Admin routes are gated by `authorize(["Admin"])`, so a `User` token receives a
403 rather than being redirected — an expired token and an unauthorised one are
deliberately treated as different failures.

## Scripts

| Workspace | Command | Does |
| --- | --- | --- |
| `server` | `npm run dev` | Watch mode via `tsx` |
| | `npm run build` | Compile with `tsc` + rewrite path aliases |
| | `npm start` | Run the compiled build |
| | `npm test` | Unit tests (`node:test`, no DB required) |
| | `npm run lint` / `npm run format` | ESLint / Prettier |
| `client` | `npm run dev` | Vite dev server |
| | `npm run build` | Type-check then build |
| | `npm run lint` / `npm run format` | ESLint / Prettier |
| | `npx knip` | Unused files, dependencies and exports |
| `admin` | `npm run dev` | Next.js dev server (Turbopack) |
| | `npm run build` / `npm start` | Production build and serve |
| | `npm run lint` | ESLint |

## API conventions

Every JSON endpoint responds with the same envelope, so clients can handle
success and failure uniformly:

```jsonc
{
  "success": true,
  "message": "My orders fetched successfully",
  "data": [ /* payload */ ],
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

`pagination` is only present on list endpoints. Failures use the same shape with
`success: false` and a matching HTTP status:

```jsonc
{
  "success": false,
  "message": "Invalid or expired reset token",
  "data": { "code": "API_ERROR" }
}
```

`data.code` is `API_ERROR` for handled `AppError`s, `INTERNAL_SERVER_ERROR` for
5xx, and a more specific value where a middleware sets one — `FORBIDDEN` from
`authorize`, `NOT_FOUND` for unmatched routes, `RATE_LIMITED` when throttled.
Unexpected errors are logged and reported as a generic 500 so internals are not
leaked to the client.

Collection endpoints accept `?page` and `?limit` (max 100).

## Deployment

`render.yaml` builds and serves the `server/` workspace as a Node web service
(health check on `/`). The storefront and admin dashboard are deployed
separately as static/Node apps and point at the API via their public base URL
variables.

## Author

Built by [Anirudh Kille](https://github.com/anirudhkille).
