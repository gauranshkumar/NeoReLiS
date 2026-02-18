# NeoReLiS Primary Backend

## Stack
- Runtime: Bun
- API Framework: Hono
- Validation: Zod
- Database: PostgreSQL + Drizzle ORM (to be configured)

## Commands
```bash
bun run dev    # Start dev server with hot reload
bun run start  # Start production server
bun test       # Run tests
```

## API Structure
- `/api/v1/auth/*` - Authentication routes
- `/api/v1/projects/*` - Project management routes

## Key Files
- `src/index.ts` - Main app entry with middleware
- `src/routes/auth.ts` - Auth endpoints (register, login, logout, password reset)
- `src/routes/projects.ts` - Project CRUD and member management

## Development Notes
- Uses Hono middleware: cors, logger, prettyJSON, requestId
- Zod validation via @hono/zod-validator
- All routes return standard JSON format: `{ code, message, details?, requestId }`
- 404 and error handlers configured