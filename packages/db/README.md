# packages/db

Shared database package for NeoReLiS. Owns the Prisma schema, generated client, migrations, and the seed script. Consumed as a workspace package (`@neorelis/db`) by `apps/primary-backend`.

## What it provides

- **`prisma/schema.prisma`** — single source of truth for the PostgreSQL schema. All entities use UUID primary keys and live under the `neorelis_default` schema.
- **Generated client** — `node_modules/@prisma/client`, regenerated from the schema.
- **`index.ts`** — re-exports `prisma`, Prisma types, and enum values for downstream apps.
- **`prisma/seed.ts`** — populates the database with sample users, projects, papers, screening phases, QA templates, extraction forms, audit logs, and admin config.
- **`prisma/migrations/`** — versioned migration history (each folder is one migration).

## Stack

- **Prisma** `^6.4.1` (`@prisma/client` + `prisma` CLI)
- **PostgreSQL** `14+`
- **tsx** for running TS scripts (used by the seed)
- **dotenv** to load the package's `.env`

## Environment variables

```sh
cp packages/db/.env.example packages/db/.env
```

```env
# PostgreSQL connection string consumed by the Prisma CLI and runtime client.
DATABASE_URL=postgresql://postgres:password@localhost:5432/neorelis?schema=public
```

`schema.prisma` also pins `schemas = ["neorelis_default"]`, so the generated SQL targets the `neorelis_default` schema inside the configured database.

## Scripts

Run from this folder, or via Turbo from the repo root.

| Command              | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `bun run db:generate`| Generate the Prisma client into `node_modules/@prisma/client`.       |
| `bun run db:push`    | Push the current schema to the database (no migration file).          |
| `bun run db:migrate` | Create + apply a new migration from schema changes.                  |
| `bun run db:studio`  | Open Prisma Studio at <http://localhost:5555>.                        |
| `bun run db:seed`    | Reset and reseed the database using `prisma/seed.ts`.                 |

> The `prisma.seed` config in `package.json` makes `prisma db seed` invoke `bun prisma/seed.ts` automatically. If you change the seed entry point, update that field too.

## Typical workflows

### First-time setup

```sh
# From the repo root
bun install
bun run db:generate
bun run db:push
bun run db:seed     # optional, for sample data
```

### Schema change → migration

```sh
# Edit prisma/schema.prisma, then:
bun run db:migrate -- --name <short_description>
```

This generates a new folder under `prisma/migrations/` and applies it to the database. Commit the entire new folder.

### Schema change → quick prototype (no migration)

```sh
bun run db:push
```

Useful for local exploration, but **never** use this in shared environments — it bypasses migration history.

### Inspect data

```sh
bun run db:studio
```

Opens a browser UI against the configured `DATABASE_URL`.

## Seed script

`prisma/seed.ts` wipes the relevant tables in dependency order, then creates a small but realistic dataset:

- 2 user groups, 5 users (1 admin, 1 manager, 2 reviewers, 1 validator).
- 2 projects (one `PUBLISHED`, one `DRAFT`).
- Project memberships, configs, inclusion/exclusion criteria.
- 5 venues, 6 authors, 8 papers across various screening statuses.
- A screening phase with assignments and decisions.
- A QA template with two questions and weighted options.
- A published extraction form with five fields.
- A completed import job, audit log entries, and platform-level `AdminConfig` / `Info` / `StringResource` rows.

The summary at the end prints row counts per entity. Use this as a template when adding new seed fixtures — preserve the cleanup-before-create order.

## Using the client in another workspace

The package is imported as `@neorelis/db`:

```ts
import { prisma, ProjectStatus } from "@neorelis/db";

const projects = await prisma.project.findMany({
  where: { status: ProjectStatus.PUBLISHED },
});
```

`@neorelis/db` is marked as a dependency in `apps/primary-backend/package.json` via the `workspace:*` protocol, so Bun links the local package automatically.

## Common pitfalls

- **`Environment variable not found: DATABASE_URL`** — `packages/db/.env` is missing or the working directory is wrong. Prisma loads `.env` from the directory you invoke it from, so run commands from `packages/db` or use Turbo from the root.
- **`prisma generate` produced no client** — ensure `bun install` finished; the generator writes into `node_modules/@prisma/client` which lives in this package's `node_modules` workspace.
- **Seed fails midway** — the script is not transactional on purpose so partial state can be inspected. Re-run it; it always wipes before recreating.
- **Migration drift** — if `db:migrate` warns about drift, run `bun run db:push` to realign locally, then regenerate the migration.