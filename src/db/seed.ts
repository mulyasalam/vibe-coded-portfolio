import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import { profile, projects } from "../lib/data";
import { users, projects as projectsTbl } from "./schema";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (!url) {
  console.error(
    "✗ DATABASE_URL is not set. Add it to .env.local before seeding."
  );
  process.exit(1);
}

const client = postgres(url, { prepare: false });
const db = drizzle(client);

async function main() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log(
      "✓ Database already seeded — skipping. (Drop the tables in Drizzle Studio or your DB to reseed.)"
    );
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
  .then(() => client.end({ timeout: 2 }))
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
