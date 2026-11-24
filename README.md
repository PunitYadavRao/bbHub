# BBHub

BackBencher Hub: an anonymous, campus-verified student platform.
Next.js (App Router), TypeScript, Tailwind CSS, Drizzle ORM on Neon Postgres, Better Auth.

## Routes

- `/`: public landing page with Sign up / Log in
- `/join`: sign in with a college Google account, then pick an anonymous username and avatar
- `/home`: signed-in home (placeholder until the feed is built)

Only Google accounts on `rishihood.edu.in` (and subdomains such as `nst.rishihood.edu.in`)
can sign in. The allowed domains live in the `colleges` table.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, BETTER_AUTH_SECRET, Google credentials
npm run db:migrate           # create tables
npm run db:seed              # add the college and the 10 preset avatars
npm run dev                  # http://localhost:3000
```

Without Google credentials the app runs, but the Google button is disabled.

## Database changes

1. Edit `db/schema.ts`.
2. `npm run db:generate` writes a migration to `db/drizzle/`.
3. `npm run db:migrate` applies it to the database in `DATABASE_URL`.

## Production (Netlify)

Site settings needed: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (https://bbhub.app),
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. In Google Cloud, also register the redirect URI
`https://bbhub.app/api/auth/callback/google`.

## Structure

- `db/`: schema (private user vault, preset avatars, posts), connection, migrations, seed
- `lib/auth.ts`: Better Auth config: Google only, college-domain check, ban check
- `lib/handle-rules.ts`, `lib/handles.ts`: username rules and suggestions
- `lib/onboarding.ts`: one-time username and avatar save
- `app/api/`: auth handler, username suggest/check, avatars, onboarding
