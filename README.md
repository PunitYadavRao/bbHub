# BBHub

BackBencher Hub: an anonymous, campus-verified student platform.
Next.js (App Router), TypeScript, Tailwind CSS, Drizzle ORM on Postgres, Better Auth.

## Routes

- `/`: public landing page
- `/join`: sign in with a college email (Google or 6-digit code), then pick an anonymous handle
- `/home`: signed-in home (placeholder until the feed is built)

## Local setup

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL (any local Postgres) and BETTER_AUTH_SECRET
npm run db:migrate           # create tables and add the college
npm run dev                  # http://localhost:3000
```

Without `RESEND_API_KEY`, login codes are printed in the `npm run dev` terminal.
Without Google credentials, the Google button is hidden.

## Database changes

1. Edit `db/schema.ts`.
2. `npm run db:generate` writes a migration to `db/drizzle/` and copies the SQL to
   `netlify/database/migrations/`.
3. `npm run db:migrate` applies it locally. Netlify applies it to production on the next deploy.

## Production (Netlify)

Netlify Database provides `NETLIFY_DB_URL` automatically. Site settings needed:
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `EMAIL_FROM`, `RESEND_API_KEY`
(optionally `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`).

## Scripts

`dev`, `build`, `lint`, `typecheck`, `db:generate`, `db:migrate`, `db:studio`

## Structure

- `db/`: Postgres schema (private user vault), connection, Drizzle migration history
- `netlify/database/migrations/`: SQL Netlify applies on deploy
- `lib/auth.ts`: Better Auth config, campus-domain gate, ban check
- `lib/handle-rules.ts`, `lib/handles.ts`: handle validation and generation
- `lib/onboarding.ts`: one-time handle, hostel and batch save
- `app/api/`: auth handler, handle suggestions and checks, onboarding
