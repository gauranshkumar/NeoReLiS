# primary-backend

NeoReLiS API backend (Hono + Bun). Follows **MVC** as per project rules.

## MVC architecture

- **Models (data layer)**  
  - Domain data lives in `packages/db` (Prisma schema + client).  
  - In this app, **services** (`src/services/`) encapsulate all data access and domain logic. Controllers never import `prisma` directly.

- **Views (presentation layer)**  
  - **Views** (`src/views/`) serialize entities into API response shapes. All JSON response formatting is done here so controllers stay thin.

- **Controllers (request/response layer)**  
  - **Routes** (`src/routes/`) are the controllers: they validate input, call **services**, then pass results to **views** and return the response.

Request flow: **Route (controller)** → **Service (model/data)** → **View (response)** → client.

## Commands

```bash
bun install
bun run dev    # start server with hot reload (src/server.ts)
bun run start  # production start
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
