/**
 * One-shot copy of your local SQLite database into a remote Postgres.
 *
 * Use this if you've been editing /admin locally (writing to data/app.db)
 * and want to carry those projects/profile/messages into Postgres before
 * deploying.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "postgres://...neon.tech/db?sslmode=require"
 *   npm run db:push           # ensure schema exists in Postgres
 *   npm run db:migrate-local  # copy data/app.db → DATABASE_URL
 *
 * Safe to re-run: rows are upserted by primary key. Your local SQLite
 * file is read-only here — nothing on your laptop is changed.
 */

import { createClient } from "@libsql/client";
import postgres from "postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { sqliteTable, text as sqliteText, integer as sqliteInt } from "drizzle-orm/sqlite-core";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { users, projects, messages } from "./schema";

config({ path: ".env.local" });
config();

const target =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (!target) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}
if (target.startsWith("file:") || target.startsWith("libsql:")) {
  console.error(
    "✗ DATABASE_URL points at SQLite/libSQL — this script copies LOCAL SQLite → Postgres."
  );
  console.error("  Set DATABASE_URL to your Postgres URL before running.");
  process.exit(1);
}

const localPath = "./data/app.db";
if (!existsSync(localPath)) {
  console.error(`✗ No local SQLite DB found at ${localPath}. Nothing to migrate.`);
  process.exit(1);
}

// Source: SQLite (matches the OLD sqlite-core schema we used to ship).
type Social = { label: string; handle: string; href: string };
const sqliteUsers = sqliteTable("users", {
  id: sqliteText("id").primaryKey(),
  email: sqliteText("email").notNull().unique(),
  name: sqliteText("name").notNull(),
  role: sqliteText("role").notNull(),
  city: sqliteText("city").notNull(),
  locale: sqliteText("locale").notNull(),
  bio: sqliteText("bio").notNull(),
  longBio: sqliteText("long_bio").notNull(),
  cvUrl: sqliteText("cv_url"),
  cvName: sqliteText("cv_name"),
  cvSize: sqliteInt("cv_size"),
  cvUploadedAt: sqliteText("cv_uploaded_at"),
  socials: sqliteText("socials", { mode: "json" }).$type<Social[]>().notNull(),
  createdAt: sqliteText("created_at").notNull(),
});
const sqliteProjects = sqliteTable("projects", {
  id: sqliteText("id").primaryKey(),
  userId: sqliteText("user_id").notNull(),
  title: sqliteText("title").notNull(),
  client: sqliteText("client").notNull(),
  category: sqliteText("category").notNull(),
  year: sqliteInt("year").notNull(),
  linkUrl: sqliteText("link_url").notNull(),
  imageUrl: sqliteText("image_url").notNull(),
  techStack: sqliteText("tech_stack", { mode: "json" }).$type<string[]>().notNull(),
  summary: sqliteText("summary").notNull(),
  sortOrder: sqliteInt("sort_order").notNull(),
  createdAt: sqliteText("created_at").notNull(),
});
const sqliteMessages = sqliteTable("messages", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  email: sqliteText("email").notNull(),
  subject: sqliteText("subject").notNull(),
  message: sqliteText("message").notNull(),
  readAt: sqliteText("read_at"),
  createdAt: sqliteText("created_at").notNull(),
});

const sourceClient = createClient({ url: "file:./data/app.db" });
const source = drizzleSqlite(sourceClient);

const targetClient = postgres(target, { prepare: false });
const dest = drizzlePg(targetClient);

function isoStamp(v: unknown): string {
  if (!v) return new Date().toISOString();
  const s = String(v);
  // SQLite default `current_timestamp` returns "YYYY-MM-DD HH:MM:SS" — make it ISO.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    return new Date(s.replace(" ", "T") + "Z").toISOString();
  }
  return s;
}

async function main() {
  const localUsers = await source.select().from(sqliteUsers);
  const localProjects = await source.select().from(sqliteProjects);
  const localMessages = await source.select().from(sqliteMessages);

  console.log(
    `→ source (SQLite): ${localUsers.length} users, ${localProjects.length} projects, ${localMessages.length} messages`
  );

  if (localUsers.length === 0) {
    console.error("✗ Local SQLite is empty — nothing to migrate.");
    process.exit(1);
  }

  for (const u of localUsers) {
    await dest
      .insert(users)
      .values({
        ...u,
        createdAt: isoStamp(u.createdAt),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: u.email,
          name: u.name,
          role: u.role,
          city: u.city,
          locale: u.locale,
          bio: u.bio,
          longBio: u.longBio,
          cvUrl: u.cvUrl,
          cvName: u.cvName,
          cvSize: u.cvSize,
          cvUploadedAt: u.cvUploadedAt,
          socials: u.socials,
        },
      });
  }

  for (const p of localProjects) {
    await dest
      .insert(projects)
      .values({
        ...p,
        createdAt: isoStamp(p.createdAt),
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          userId: p.userId,
          title: p.title,
          client: p.client,
          category: p.category,
          year: p.year,
          linkUrl: p.linkUrl,
          imageUrl: p.imageUrl,
          techStack: p.techStack,
          summary: p.summary,
          sortOrder: p.sortOrder,
        },
      });
  }

  for (const m of localMessages) {
    await dest
      .insert(messages)
      .values({
        ...m,
        createdAt: isoStamp(m.createdAt),
      })
      .onConflictDoUpdate({
        target: messages.id,
        set: {
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          readAt: m.readAt,
        },
      });
  }

  const counts = {
    users: (await dest.select().from(users)).length,
    projects: (await dest.select().from(projects)).length,
    messages: (await dest.select().from(messages)).length,
  };
  console.log(
    `✓ done. Postgres now has ${counts.users} users, ${counts.projects} projects, ${counts.messages} messages.`
  );
  console.log(
    "  NOTE: image_url / cv_url still reference /uploads/... — re-upload in production /admin to push files into Vercel Blob."
  );
}

main()
  .then(() => targetClient.end({ timeout: 2 }))
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
