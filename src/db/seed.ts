import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "dotenv";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { profile, projects } from "../lib/data";
import { users, projects as projectsTbl } from "./schema";

config({ path: ".env.local" });
config();

const dataDir = path.join(process.cwd(), "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/app.db",
});
const db = drizzle(client);

async function main() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("✓ Database already seeded — skipping. (run db:push then delete data/app.db to reseed)");
    return;
  }

  const userId = "u_admin";
  await db.insert(users).values({
    id: userId,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    city: profile.city,
    locale: profile.locale,
    bio: profile.bio,
    longBio: profile.longBio,
    cvUrl: null,
    cvName: null,
    cvSize: null,
    cvUploadedAt: null,
    socials: profile.socials,
  });

  await db.insert(projectsTbl).values(
    projects.map((p, i) => ({
      id: p.id,
      userId,
      title: p.title,
      client: p.client,
      category: p.category,
      year: p.year,
      linkUrl: p.href,
      imageUrl: p.image,
      techStack: p.tech,
      summary: p.summary,
      sortOrder: i,
    }))
  );

  console.log(`✓ Seeded 1 user + ${projects.length} projects.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
