# apps/frontend

The NeoReLiS web client. A Next.js 16 app (App Router, React 19, Tailwind CSS v4) that talks to `apps/primary-backend` over REST and serves localized UI via `next-intl`.

## Stack

- **Next.js** `16.1.6` (App Router, Turbopack dev server)
- **React** `19.2.3`
- **Tailwind CSS** `^4` (PostCSS-based config in `postcss.config.mjs`)
- **next-intl** `^4.8` — i18n via `./i18n` (see `i18n/request.ts`, `i18n/config.ts`, `i18n/messages/`)
- **lucide-react** for icons, **clsx** + **tailwind-merge** for class composition
- **TypeScript** `^5`

## Folder layout

```text
apps/frontend/
├── app/                  # App Router pages (route segments)
│   ├── about-us/
│   ├── dashboard/
│   ├── demo-user/
│   ├── design-demo/
│   ├── help-center/
│   ├── login/
│   ├── signup/
│   ├── verify-email/
│   ├── layout.tsx        # Root layout (i18n provider, navbar, footer)
│   ├── page.tsx          # Landing page
│   ├── globals.css       # Tailwind v4 entry
│   └── not-found.tsx
├── components/           # Shared client components
│   ├── auth/             # Login/signup form pieces
│   ├── dashboard/        # Dashboard widgets
│   ├── landing/          # Landing-page blocks
│   ├── ui/               # Generic UI primitives
│   ├── header.tsx
│   ├── footer.tsx
│   ├── language-switcher.tsx
│   ├── providers.tsx     # React context providers (theme, etc.)
│   └── unified-navbar.tsx
├── lib/                  # Frontend utilities
│   ├── api.ts            # Typed API client (fetch wrappers)
│   ├── utils.ts          # cn() and small helpers
│   └── hooks/            # Reusable React hooks
├── i18n/
│   ├── config.ts
│   ├── request.ts        # next-intl request config
│   └── messages/         # Translation JSON per locale
├── public/               # Static assets served at the site root
├── next.config.ts        # Rewrites /api/* -> backend, next-intl plugin
├── eslint.config.mjs
├── postcss.config.mjs
└── tsconfig.json
```

## API proxying

`next.config.ts` rewrites every `/api/*` request to `${NEXT_PUBLIC_API_URL}/api/*`. In development this means you can call `/api/v1/auth/login` from the browser without worrying about CORS, and the backend's port stays hidden from the URL bar.

## Environment variables

Copy the template and adjust as needed:

```sh
cp apps/frontend/.env.example apps/frontend/.env
```

```env
# URL of the primary backend API server.
# Dev: http://localhost:<PORT>  (matches apps/primary-backend/.env PORT)
# Prod: https://api.your-deployment.example.com
NEXT_PUBLIC_API_URL=http://localhost:9078
```

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build time. Restart `next dev` after changing them.

## Scripts

Run from this folder, or use Turbo filters from the repo root (`bun run dev --filter=frontend`, etc.).

| Command         | What it does                                            |
| --------------- | ------------------------------------------------------- |
| `bun run dev`   | Start the Next.js dev server with Turbopack on `:3000`. |
| `bun run build` | Production build (`.next/`).                            |
| `bun run start` | Serve the production build (requires `build` first).    |
| `bun run lint`  | Run ESLint (`eslint .`).                                |

## Adding a new page

1. Create a route segment under `app/<segment>/page.tsx`.
2. Add any shared component into `components/<area>/`.
3. If the page needs the API, use the helpers in `lib/api.ts`.
4. Add new translatable strings to `i18n/messages/<locale>.json`; the `useTranslations()` hook reads from there.

## Internationalization

- Locale list and defaults live in `i18n/config.ts`.
- Server-side messages are resolved in `i18n/request.ts`.
- Add a new locale by dropping a JSON file in `i18n/messages/` and registering it in `config.ts`.
- Use the `<LanguageSwitcher />` component to switch locales at runtime.

## Common pitfalls

- **CORS / 404 on API calls** — make sure the backend is running on the port set in `NEXT_PUBLIC_API_URL`, or that the rewrite path matches your route.
- **Env var not picked up** — only variables prefixed with `NEXT_PUBLIC_` are visible in the browser, and changes require a dev-server restart.
- **Hydration warnings from `next-intl`** — wrap any server-only message resolution with `setRequestLocale()` in the route's `page.tsx`/`layout.tsx`.
