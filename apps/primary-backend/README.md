# apps/primary-backend

NeoReLiS REST API server. Built with [Hono](https://hono.dev) running on the [Bun](https://bun.sh) runtime. All persistence goes through `@neorelis/db` (Prisma → PostgreSQL).

The codebase follows a strict **MVC** layering:

- **Models / data layer** — `packages/db` (Prisma schema + generated client).
- **Services** (`src/services/`) — domain logic and data access. Routes never import `prisma` directly.
- **Views** (`src/views/`) — JSON response serializers. Keep controllers thin.
- **Controllers / routes** (`src/routes/`) — HTTP entry points: validate input → call service → return view.

Request flow: **Route (controller)** → **Service (model/data)** → **View (response)** → client.

## Stack

- **Bun** `1.3.8` runtime (hot reload, package manager, test runner)
- **Hono** `^4` HTTP framework with `@hono/node-server` adapter
- **Zod** + `@hono/zod-validator` for request validation
- **Prisma** (via `@neorelis/db`) for PostgreSQL
- **jsonwebtoken** for auth tokens, **bcryptjs** for password hashing
- **nodemailer** for transactional email (invitations, verification)
- **@retorquere/bibtex-parser** + **papaparse** for paper import pipelines
- **hono-rate-limiter** for endpoint throttling

## Folder layout

```text
apps/primary-backend/
├── index.ts                # Hono app definition (mounted routes, CORS, error handler)
├── server.ts               # Bun.serve entry point
├── src/
│   ├── routes/             # Controllers — one file per resource
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   ├── papers.ts
│   │   ├── screening.ts
│   │   ├── quality-assessment.ts
│   │   ├── data-extraction.ts
│   │   ├── reporting.ts
│   │   ├── invitations.ts
│   │   ├── project-invitations.ts
│   │   ├── notifications.ts
│   │   ├── manager.ts
│   │   └── element.ts
│   ├── services/           # Domain logic, all prisma access
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   ├── paper.service.ts
│   │   ├── screening.service.ts
│   │   ├── qa.service.ts
│   │   ├── extraction.service.ts
│   │   ├── invitation.service.ts
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   ├── email-verification.service.ts
│   │   ├── import.service.ts
│   │   ├── draft.service.ts
│   │   └── parsers/        # BibTeX / CSV / EndNote parsing helpers
│   ├── views/              # Response serializers
│   │   ├── user.view.ts
│   │   └── project.view.ts
│   ├── middleware/         # Cross-cutting concerns
│   │   ├── auth.ts         # JWT verification
│   │   └── project-access.ts  # Project membership checks
│   ├── lib/                # Internal utilities (mailer, helpers, etc.)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Misc helpers
└── package.json
```

## Environment variables

```sh
cp apps/primary-backend/.env.example apps/primary-backend/.env
```

```env
# Runtime
PORT=9078
NODE_ENV=development

# JWT
JWT_SECRET=super-secret-jwt-key-for-development-only-change-in-production
JWT_EXPIRY=7d

# SMTP — required for invitation / verification email flows.
# Leave blank to disable outbound email (signup/invite flows will no-op).
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_PORT=
SMTP_SECURE=true

# How long project invitations stay valid (seconds). Defaults to 24h.
INVITATION_EXPIRY_SECONDS=86400
```

## Scripts

Run from this folder or via Turbo from the repo root.

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `bun run dev`        | `bun --hot src/server.ts` — hot reload on file changes.   |
| `bun run start`      | `bun run src/server.ts` — production start (no reload).   |
| `bun run test`       | `bun test` — run all `*.test.ts` files.                   |

## Adding a new endpoint

1. Add or extend the relevant service in `src/services/` for any data access. **Routes must not import `prisma` directly.**
2. Add (or extend) a view in `src/views/` for the response shape.
3. Add the route in `src/routes/<resource>.ts`. Validate input with Zod, then call the service and pass the result through the view.
4. Mount the route in `index.ts` if it is a new file.
5. Add a `bun test` spec under `src/` covering at least the happy path and one validation failure.

## Error handling

- Use `c.json({ error: ... }, status)` from inside a route to return typed errors.
- Validation failures raised by `@hono/zod-validator` are mapped to `400` automatically.
- Service-level domain errors should be thrown as typed errors and caught by the global error handler in `index.ts`.

## Auth quick reference

- `middleware/auth.ts` exports an `authMiddleware()` that validates the `Authorization: Bearer <jwt>` header and stores the user on `c.var.user`.
- `middleware/project-access.ts` checks project membership for project-scoped routes; pass the project id via route param or query.
- Routes that should remain public (e.g. login, signup, health) must not mount these middlewares.

## Common pitfalls

- **Port mismatch with the frontend** — the frontend's `NEXT_PUBLIC_API_URL` must match the `PORT` in this app's `.env`.
- **Stale Prisma client after schema edits** — run `bun --cwd ../../packages/db run db:generate` from this folder (or `bun run db:generate` from the repo root) and restart the server.
- **SMTP misconfiguration** — without valid SMTP settings, invitation and verification emails silently no-op; check the server logs for delivery errors.