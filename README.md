# INFE Talent

SEO-friendly business website built with Next.js App Router, TypeScript, Tailwind CSS, Payload CMS, and SQLite for local development.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run payload:types
npm run payload:importmap
npm run payload:seed
```

## Local Setup

1. Copy `.env.example` to `.env.local` and set a strong `PAYLOAD_SECRET`.
2. Run `npm install`.
3. Run `npm run payload:seed` to populate the Figma-derived homepage content.
4. Run `npm run dev` and open `http://localhost:3000`.

Payload admin is available at `/admin`. Create the first admin user there.

## Live Payload Admin

Do not run the live admin on SQLite in Vercel. Serverless instances cannot share the SQLite file, so Payload sessions and edits can disappear between requests, causing logout or "not permitted" errors after an edit.

Set these environment variables in production:

```bash
PAYLOAD_SECRET=<long-random-secret>
NEXT_PUBLIC_SITE_URL=https://your-domain.com
PAYLOAD_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
DATABASE_URL=postgresql://user:password@host:5432/database
PAYLOAD_ENABLE_SCHEMA_PUSH=true
```

After the database schema exists, `PAYLOAD_ENABLE_SCHEMA_PUSH` can be turned off if migrations are managed separately.
