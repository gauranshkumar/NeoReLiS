# NeoReLiS

NeoReLiS is a Turborepo monorepo that hosts the next-generation ReLiS platform — a tool for managing systematic literature reviews (import, screening, quality assessment, data extraction, and reporting).

The repo is split into two Next.js apps plus shared packages:

- `apps/frontend` — Next.js 16 web client (React 19, Tailwind v4, `next-intl`).
- `apps/primary-backend` — Bun + Hono API server exposing the REST surface consumed by the frontend.
- `packages/db` — Prisma schema, generated client, and seed script (PostgreSQL).
- `packages/ui` — Shared React component library.
- `packages/eslint-config`, `packages/typescript-config` — Shared lint and TS configs.

## Prerequisites

| Tool      | Version                                | Notes                                          |
| --------- | -------------------------------------- | ---------------------------------------------- |
| Node.js   | `>=18`                                 | Engines field in root `package.json`.          |
| Bun       | `1.3.8`                                | Declared as `packageManager`; used for install, scripts, and the backend runtime. Install from [bun.sh](https://bun.sh). |
| PostgreSQL | `14+` (any recent release)            | Local instance or container reachable at the URL you set in `DATABASE_URL`. |
| Turbo     | Optional — invoked via `bunx`/`npx`    | Not required globally.                         |

## 1. Clone and install

```sh
git clone <your-fork-or-origin-url> NeoReLiS
cd NeoReLiS
bun install
```

`bun install` resolves all workspace packages (`apps/*` and `packages/*`) in one pass.

## 2. Configure environment variables

Three `.env` files are needed — one per app/package that talks to a service or the database.

```sh
cp packages/db/.env.example        packages/db/.env
cp apps/primary-backend/.env.example apps/primary-backend/.env
cp apps/frontend/.env.example      apps/frontend/.env
```

### `packages/db/.env`

Used by Prisma CLI and the generated client.

```env
# PostgreSQL connection string consumed by prisma
DATABASE_URL=postgresql://postgres:password@localhost:5432/neorelis?schema=public
```

### `apps/primary-backend/.env`

Used by the Hono API server.

```env
PORT=9078
NODE_ENV=development

JWT_SECRET=super-secret-jwt-key-for-development-only-change-in-production
JWT_EXPIRY=7d

# Optional — only required if you exercise the invitation / email flows.
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_PORT=
SMTP_SECURE=true

INVITATION_EXPIRY_SECONDS=86400
```

### `apps/frontend/.env`

Consumed at build time by Next.js (must be prefixed with `NEXT_PUBLIC_`).

```env
NEXT_PUBLIC_API_URL=http://localhost:9078
```

> Keep the `NEXT_PUBLIC_API_URL` port aligned with `PORT` in the backend `.env`.

## 3. Start PostgreSQL

Any local Postgres reachable at `DATABASE_URL` works. A quick Docker option:

```sh
docker run --name neorelis-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=neorelis \
  -p 5432:5432 \
  -d postgres:16
```

Adjust the user/password/host in `DATABASE_URL` to match.

## 4. Set up the database

From the repo root:

```sh
# Generate the Prisma client (writes to node_modules/@prisma/client)
bun run db:generate

# Apply the schema to your database
bun run db:push

# (Optional) Seed sample data
bun run db:seed
```

> If `db:push` is not proxied from the root, run it inside the package:
> `bun --cwd packages/db run db:push`.

## 5. Run the apps

### All workspaces (recommended for full-stack dev)

```sh
bun run dev
```

This invokes `turbo run dev`, which starts every workspace that defines a `dev` script in parallel with hot reload.

### Run a single app

```sh
# Frontend only — http://localhost:3000
bun run dev --filter=frontend

# Backend only — http://localhost:9078
bun run dev --filter=primary-backend
```

### Run individual scripts directly

```sh
# Frontend
bun --cwd apps/frontend run dev

# Backend (Bun runtime, hot reload)
bun --cwd apps/primary-backend run dev
```

## 6. Verify the setup

- Frontend: open <http://localhost:3000>.
- Backend: `curl http://localhost:9078/health` (or whichever route your `server.ts` exposes). You should get a `200` response.
- Database: `bun --cwd packages/db run db:studio` opens Prisma Studio at <http://localhost:5555>.

## 7. Other useful scripts

From the repo root:

| Script                | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `bun run build`       | Builds every workspace via `turbo run build`.        |
| `bun run lint`        | Runs ESLint across the monorepo.                      |
| `bun run check-types` | Runs TypeScript type checks per workspace.            |
| `bun run format`      | Formats `.ts`, `.tsx`, and `.md` files with Prettier. |

For a single workspace, append `--filter=<name>` (e.g. `bun run build --filter=primary-backend`).

## Project layout

```text
NeoReLiS/
├── apps/
│   ├── frontend/         # Next.js 16 web client
│   └── primary-backend/  # Hono + Bun API
├── packages/
│   ├── db/               # Prisma schema + client + seed
│   ├── ui/               # Shared React components
│   ├── eslint-config/    # Shared ESLint configs
│   └── typescript-config/# Shared tsconfig bases
├── turbo.json
└── package.json
```

## Troubleshooting

- **`prisma generate` fails with a missing `DATABASE_URL`** — make sure `packages/db/.env` exists and contains a valid Postgres URL.
- **Frontend cannot reach the backend** — confirm `NEXT_PUBLIC_API_URL` matches the backend `PORT`, and that no firewall/CORS rule is blocking the origin.
- **Bun not found** — install Bun (`curl -fsSL https://bun.sh/install | bash`) and ensure `~/.bun/bin` is on your `PATH`.
- **Port already in use** — change `PORT` in `apps/primary-backend/.env` and update `NEXT_PUBLIC_API_URL` in `apps/frontend/.env` to match.
- **Stale Prisma client** — re-run `bun run db:generate` after editing `packages/db/prisma/schema.prisma`.

## License

See [`LICENSE`](./LICENSE).