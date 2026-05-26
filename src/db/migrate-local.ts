/**
 * One-shot copy of your local SQLite database into a remote libSQL (Turso).
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "libsql://<host>.turso.io?authToken=<token>"
 *   npm run db:push           # ensure schema exists on the target
 *   npm run db:migrate-local  # copy users/projects/messages from data/app.db
 *
 * Usage (bash):
 *   DATABASE_URL='libsql://<host>.turso.io?authToken=<token>' \
 *     npm run db:push && npm run db:migrate-local
 *
 * Safe to re-run: rows are upserted by primary key.
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "dotenv";
import { users, projects, messages } from "./schema";

config({ path: ".env.local" });
config();

const target = process.env.DATABASE_URL;
if (!target) {
  console.error("✗ DATABASE_URL is not set. Aborting.");
  process.exit(1);
}
if (target.startsWith("file:")) {
  console.error(
    "✗ DATABASE_URL points at a local file — this script copies LOCAL → REMOTE."
  );
  console.error(
    "  Set DATABASE_URL to your Turso libsql URL before running. Local DB stays untouched."
  );
  process.exit(1);
}

const localClient = createClient({ url: "file:./data/app.db" });
const remoteClient = createClient({ url: target });
const local = drizzle(localClient);
const remote = drizzle(remoteClient);

async function main() {
  const localUsers = await local.select().from(users);
  const localProjects = await local.select().from(projects);
  const localMessages = await local.select().from(messages);

  console.log(
    `→ source: ${localUsers.length} users, ${localProjects.length} projects, ${localMessages.length} messages`
  );

  if (localUsers.length === 0) {
    console.error(
      "✗ Local DB looks empty. Did you run `npm run db:setup` locally first?"
    );
    process.exit(1);
  }

  for (const u of localUsers) {
    await remote
      .insert(users)
      .values(u)
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
    await remote
      .insert(projects)
      .values(p)
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
    await remote
      .insert(messages)
      .values(m)
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

  const remoteCounts = {
    users: (await remote.select().from(users)).length,
    projects: (await remote.select().from(projects)).length,
    messages: (await remote.select().from(messages)).length,
  };
  console.log(
    `✓ done. target now has ${remoteCounts.users} users, ${remoteCounts.projects} projects, ${remoteCounts.messages} messages.`
  );
  console.log(
    "  NOTE: project image_urls still point at /uploads/... — re-upload images via /admin in production to push them into Vercel Blob."
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
