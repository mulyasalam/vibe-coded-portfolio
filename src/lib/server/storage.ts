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

export async function saveUpload(file: File, kind: UploadKind) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext =
    path.extname(file.name).toLowerCase() ||
    MIME_EXT[file.type] ||
    (kind === "cv" ? ".pdf" : ".bin");
  const name = `${kind}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return { url: `/uploads/${name}`, name: file.name, size: file.size };
}

export async function removeUpload(publicUrl: string | null | undefined) {
  if (!publicUrl) return;
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
