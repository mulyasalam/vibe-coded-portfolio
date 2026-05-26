import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type UploadKind = "cv" | "image";

const MIME_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function extFor(file: File, kind: UploadKind) {
  return (
    path.extname(file.name).toLowerCase() ||
    MIME_EXT[file.type] ||
    (kind === "cv" ? ".pdf" : ".bin")
  );
}

function genName(kind: UploadKind, ext: string) {
  return `${kind}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveUpload(file: File, kind: UploadKind) {
  const ext = extFor(file, kind);
  const name = genName(kind, ext);

  if (blobEnabled()) {
    // Vercel Blob — used in production on Vercel.
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, file, {
      access: "public",
      contentType: file.type || undefined,
    });
    return { url: blob.url, name: file.name, size: file.size };
  }

  // Local filesystem — dev and any host with a persistent disk.
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return { url: `/uploads/${name}`, name: file.name, size: file.size };
}

export async function removeUpload(publicUrl: string | null | undefined) {
  if (!publicUrl) return;

  // Vercel Blob URLs are absolute — try to delete from Blob.
  if (publicUrl.startsWith("https://") && blobEnabled()) {
    try {
      const { del } = await import("@vercel/blob");
      await del(publicUrl);
    } catch {
      /* ignore — best-effort cleanup */
    }
    return;
  }

  // Local-FS URLs.
  if (!publicUrl.startsWith("/uploads/")) return;
  const filePath = path.join(
    process.cwd(),
    "public",
    publicUrl.replace(/^\//, "")
  );
  try {
    await unlink(filePath);
  } catch {
    /* ignore */
  }
}
