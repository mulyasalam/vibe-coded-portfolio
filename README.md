# Vibe-Coded Portfolio

A personal portfolio that doubles as proof of how it was built — every project here was vibe-coded (prompted, steered, hand-finished). Public landing page plus a hidden `/admin` dashboard for editing profile, CV, projects, and reading messages from the contact form.

> Editorial brutalism in cream / ink / vermillion. Instrument Serif + Geist + Geist Mono. Server-rendered, SQLite-backed, deployable to Vercel.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + handwritten shadcn-style primitives |
| Database | SQLite via `@libsql/client` + Drizzle ORM |
| Auth | `jose` HS256 JWT in an httpOnly cookie + Next.js middleware |
| Storage | Local FS (`public/uploads/`) — see deploy notes |
| Validation | zod schemas shared by client + server |
| Email (optional) | Resend, env-gated |

---

## Quick start (local)

```bash
# 1. install
npm install

# 2. env — copy and edit
cp .env.example .env.local

# 3. database — create the SQLite file, push schema, seed defaults
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
| `DATABASE_URL` | yes | `file:./data/app.db` for local, `libsql://…` for Turso in production |
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
| `npm run db:push` | Apply Drizzle schema to the configured DB |
| `npm run db:seed` | Seed defaults from `src/lib/data.ts` (skips if already seeded) |
| `npm run db:setup` | `db:push` then `db:seed` |
| `npm run db:studio` | Open Drizzle Studio in the browser |

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

The repo is **Vercel-ready** — file uploads auto-switch to Vercel Blob the moment `BLOB_READ_WRITE_TOKEN` is set, and the DB layer already speaks libSQL. You don't need to edit code; just provision two stores and add the env vars.

#### One-time setup

**1. Provision a libSQL database (Turso — free tier is plenty)**

```bash
# Install Turso CLI: https://docs.turso.tech/cli/installation
turso auth signup
turso db create portfolio
turso db show portfolio --url        # → libsql://<...>.turso.io
turso db tokens create portfolio     # → eyJ...
```

Build the full URL and run schema push + seed against it locally:

```bash
# in your shell — DON'T commit these
export DATABASE_URL='libsql://<host>.turso.io?authToken=<token>'
npm run db:setup
```

This creates the tables and seeds your initial profile + 6 projects into Turso.

**1b. (Optional) Carry your local projects into Turso**

Your local `data/app.db` is gitignored and *never* leaves your machine — so by default the Turso DB you just created only has the original seeded defaults. To copy your current projects, profile edits, and inbox into Turso instead, run:

```bash
# DATABASE_URL still pointing at Turso from the previous step
npm run db:push            # ensure schema exists (no-op if already there)
npm run db:migrate-local   # copies data/app.db → DATABASE_URL
```

The script is idempotent (re-runs upsert by primary key) and your local DB is read-only here — nothing on your laptop is changed.

> Image URLs migrate as-is, so any `/uploads/...` paths still reference your local FS. After deploying, re-upload images for those projects through `/admin` and Vercel Blob will take over. CV: same idea.

**2. Push to GitHub** (already done) and import the repo on [vercel.com/new](https://vercel.com/new).

**3. Add a Blob store**

In the Vercel project: **Storage → Create → Blob**. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` into the project env.

**4. Set env vars** on the Vercel project (Project → Settings → Environment Variables):

| Var | Value |
|---|---|
| `DATABASE_URL` | `libsql://<host>.turso.io?authToken=<token>` |
| `ADMIN_PASSWORD` | something strong — **not** `admin` |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | *(optional)* if you want contact-form emails |
| `CONTACT_TO_EMAIL` | *(optional)* destination address |

`BLOB_READ_WRITE_TOKEN` is added automatically when you create the Blob store.

**5. Deploy.** That's it. The site is live; admin lives at `/admin/login`.

#### After deploy

- New uploads go to Vercel Blob (URLs look like `https://*.public.blob.vercel-storage.com/...`).
- All edits in `/admin` write directly to Turso — no rebuild needed.
- To **reset** content in production: re-run `npm run db:setup` locally with the production `DATABASE_URL` *after* `rm`ing the data — but be careful, this wipes prod data.

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
