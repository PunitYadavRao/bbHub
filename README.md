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
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:push              # create tables
npm run db:seed              # add the college and its email domains
npm run dev                  # http://localhost:3000
```

Without `RESEND_API_KEY`, login codes are printed in the `npm run dev` terminal.
Without Google credentials, the Google button is hidden.

## Scripts

`dev`, `build`, `lint`, `typecheck`, `db:push`, `db:seed`, `db:studio`

## Structure

- `db/`: Postgres schema (private user vault), connection, seed
- `lib/auth.ts`: Better Auth config, campus-domain gate, ban check
- `lib/handle-rules.ts`, `lib/handles.ts`: handle validation and generation
- `lib/onboarding.ts`: one-time handle, hostel and batch save
- `app/api/`: auth handler, handle suggestions and checks, onboarding
