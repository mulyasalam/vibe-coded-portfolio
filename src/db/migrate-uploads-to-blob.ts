/**
 * One-shot: find every project (and the user's CV) whose URL points at
 * the local `/uploads/...` folder, upload the file to Vercel Blob, and
 * rewrite the URL in Postgres to the new blob URL.
 *
 * Run from your laptop *once* after you've created the Vercel Blob store.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "<your Neon URL>"
 *   $env:BLOB_READ_WRITE_TOKEN = "<copy from Vercel → Storage → Blob → .env.local tab>"
 *   npx tsx src/db/migrate-uploads-to-blob.ts
 *
 * Safe to re-run: rows already pointing at https:// are skipped.
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { put } from "@vercel/blob";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!dbUrl) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}
if (!blobToken) {
  console.error(
    "✗ BLOB_READ_WRITE_TOKEN is not set. Copy it from Vercel → Storage → your Blob store → .env.local tab."
  );
  process.exit(1);
}

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

async function uploadLocal(publicUrl: string) {
  // /uploads/image-abc.png  → public/uploads/image-abc.png
  const rel = publicUrl.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  await stat(abs); // throws if missing
  const buf = await readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const blob = await put(rel, buf, {
    access: "public",
    contentType: MIME_BY_EXT[ext] ?? "application/octet-stream",
    token: blobToken,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function main() {
  const sql = postgres(dbUrl!, { prepare: false });

  // 1. Projects.
  const projectsToFix = await sql<{ id: string; image_url: string }[]>`
    SELECT id, image_url
    FROM projects
    WHERE image_url LIKE '/uploads/%'
  `;
  console.log(`→ projects to migrate: ${projectsToFix.length}`);

  for (const p of projectsToFix) {
    try {
      const newUrl = await uploadLocal(p.image_url);
      await sql`UPDATE projects SET image_url = ${newUrl} WHERE id = ${p.id}`;
      console.log(`  ✓ ${p.id}: ${p.image_url}  →  ${newUrl}`);
    } catch (err) {
      console.error(`  ✗ ${p.id}: failed (${(err as Error).message})`);
    }
  }

  // 2. CV (one user row, optional).
  const userCv = await sql<{ id: string; cv_url: string | null }[]>`
    SELECT id, cv_url FROM users WHERE cv_url LIKE '/uploads/%'
  `;
  for (const u of userCv) {
    try {
      const newUrl = await uploadLocal(u.cv_url!);
      await sql`UPDATE users SET cv_url = ${newUrl} WHERE id = ${u.id}`;
      console.log(`  ✓ CV ${u.id}: ${u.cv_url}  →  ${newUrl}`);
    } catch (err) {
      console.error(`  ✗ CV ${u.id}: failed (${(err as Error).message})`);
    }
  }

  console.log("✓ done.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
