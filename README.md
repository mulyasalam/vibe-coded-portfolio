# Vibe-Coded Portfolio

A personal portfolio that doubles as proof of how it was built — every project here was vibe-coded (prompted, steered, hand-finished). Public landing page plus a hidden `/admin` dashboard for editing profile, CV, projects, and reading messages from the contact form.

> Editorial brutalism in cream / ink / vermillion. Instrument Serif + Geist + Geist Mono. Server-rendered, Postgres-backed, deployable to Vercel.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + handwritten shadcn-style primitives |
| Database | PostgreSQL via `postgres.js` + Drizzle ORM |
| Auth | `jose` HS256 JWT in an httpOnly cookie + Next.js middleware |
| Storage | Local FS (`public/uploads/`) — see deploy notes |
| Validation | zod schemas shared by client + server |
| Email (optional) | Resend, env-gated |

---

## Quick start (local)

You need a Postgres database. The easiest option is a free [Neon](https://neon.tech) project — sign up, create a database, copy the connection string. (Docker `postgres:16` also works if you'd rather run locally.)

```bash
# 1. install
npm install

# 2. env — copy and set DATABASE_URL to your Postgres URL
cp .env.example .env.local

# 3. push the schema + seed the defaults
npm run db:setup

# 4. run
npm run dev
# → http://localhost:3000
```

That's it. The public site is at `/`, the hidden admin is at `/admin/login`.

### Default credentials

```
username: admin
password: admin       (change ADMIN_PASSWORD in .env.local)
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (Neon, Vercel Postgres, Supabase, local) |
| `ADMIN_PASSWORD` | yes | Plain string, compared in constant time. Change before deploying. |
| `SESSION_SECRET` | yes | 32+ random chars used to sign the session JWT |
| `RESEND_API_KEY` | no | Set to also email-forward contact messages |
| `CONTACT_TO_EMAIL` | no | Where to forward (required if `RESEND_API_KEY` is set) |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Run the prod build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Drizzle schema to the configured Postgres DB |
| `npm run db:seed` | Seed defaults from `src/lib/data.ts` (skips if already seeded) |
| `npm run db:setup` | `db:push` then `db:seed` |
| `npm run db:studio` | Open Drizzle Studio in the browser |
| `npm run db:migrate-local` | One-shot: copy old local SQLite `data/app.db` into Postgres |

---

## Project layout

```
src/
  app/
    layout.tsx              # root, fetches site data from DB
    page.tsx                # public landing
    admin/
      login/page.tsx        # sign-in
      page.tsx              # dashboard (profile, CV, projects)
      messages/page.tsx     # inbox
  components/
    site/                   # public sections (nav, hero, projects, contact, footer)
    admin/                  # profile-form, cv-form, projects-manager, messages-inbox
    ui/                     # button, input, textarea, label, badge, sonner
    site-data-provider.tsx  # client context wrapping the SSR’d site data
  db/
    schema.ts               # users / projects / messages
    index.ts                # drizzle client (server-only)
    seed.ts                 # `npm run db:seed`
  lib/
    schemas.ts              # zod validators
    server/                 # auth, storage, site-data (server-only)
    actions/                # auth, profile, projects, contact, messages
    data.ts                 # default profile + sample projects (seed source + SSR fallback)
  middleware.ts             # /admin/* guard
data/                       # SQLite file (gitignored)
public/uploads/             # CV + project images (gitignored)
drizzle/                    # drizzle-kit metadata
```

---

## How the data flows

1. `app/layout.tsx` (server component) calls `getSiteData()` → reads from SQLite.
2. The result is handed to a client `<SiteDataProvider>` that all public sections consume via `useSiteData()`.
3. Public **Contact** form calls `submitContactAction` (zod-validated, honeypot, persists, optional Resend ping).
4. **Admin login** calls `signInAction`, which sets a signed HS256 cookie. `src/middleware.ts` enforces it for `/admin/*` except `/admin/login`.
5. All admin mutations go through server actions in `src/lib/actions/*` and call `revalidatePath('/', 'layout')` so the public site refreshes.

---

## Deployment

### Local-style deploy (any Node host with disk)

A VPS, Fly.io with a volume, Railway with a volume — anywhere with a persistent filesystem — works as-is. After build:

```bash
npm run db:setup     # one time
npm run build
npm run start
```

### Vercel (recommended)

The repo is **Vercel-ready**. File uploads auto-switch to Vercel Blob the moment `BLOB_READ_WRITE_TOKEN` is set, and the DB layer reads from `DATABASE_URL` *or* the `POSTGRES_*` vars that Vercel auto-injects. No code changes needed — just provision two stores and set env vars.

#### One-time setup

**1. Push to GitHub** (already done) and import the repo on [vercel.com/new](https://vercel.com/new).

**2. Add a Postgres store**

Vercel project → **Storage → Create → Postgres** (Neon-backed). Vercel auto-injects `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_PRISMA_URL`, and friends into your project env.

**3. Add a Blob store**

Same dashboard: **Storage → Create → Blob**. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.

**4. Set the remaining env vars**

| Var | Value |
|---|---|
| `ADMIN_PASSWORD` | something strong — **not** `admin` |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | *(optional)* if you want contact-form emails |
| `CONTACT_TO_EMAIL` | *(optional)* destination address |

**5. Push schema + seed Postgres** (run once from your machine)

Grab the `POSTGRES_URL_NON_POOLING` value from the Vercel dashboard, then locally:

```powershell
$env:DATABASE_URL = "postgres://...neon.tech/...?sslmode=require"   # the non-pooling URL
npm run db:push       # create tables in Postgres
npm run db:seed       # seed default profile + 6 projects
```

**5b. (Optional) Carry your local projects into Postgres**

If you've been editing `/admin` locally and had a SQLite DB (`data/app.db`), you can migrate everything over instead of using the defaults:

```powershell
# DATABASE_URL still pointing at Vercel Postgres
npm run db:push              # no-op if already pushed
npm run db:migrate-local     # copies data/app.db → Postgres
```

The script is idempotent (upsert by id) and reads SQLite as-is — nothing on your machine is changed.

> Image URLs migrate as-is, so any `/uploads/...` paths still reference your local FS. After deploying, re-upload those images via `/admin` in production and Vercel Blob will take over. Same for the CV.

**6. Deploy on Vercel.** That's it. The site is live; admin lives at `/admin/login`.

#### After deploy

- New uploads go to Vercel Blob (URLs look like `https://*.public.blob.vercel-storage.com/...`).
- All `/admin` edits write directly to Postgres — no rebuild needed.
- To **reset** prod content: drop the tables in the Neon dashboard and re-run `db:setup` against the prod URL.

### Reset the local DB

```bash
rm data/app.db
npm run db:setup
```

---

## Editing content

You can either:

- **Use `/admin`** (recommended): everything is editable through the UI — profile, CV upload, projects (with image upload), socials, inbox.
- **Edit `src/lib/data.ts`** and re-seed: this only affects the *first* seed of a fresh DB. After that, `/admin` is the source of truth.

---

## What's intentionally *not* here

- No analytics, no cookie banner — add them only if you need them.
- No CV file in `public/cv.pdf` by default — upload one via `/admin` and the hero's *Download CV* button will pick it up. Otherwise it links to the missing `/cv.pdf`.
- No password recovery for admin — it's a single-admin tool; change `ADMIN_PASSWORD` in env and restart.

---

## License

MIT — do whatever you want, but please don't pass it off as your own portfolio without changing the content.
