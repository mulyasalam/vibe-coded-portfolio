"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireAdmin } from "@/lib/server/auth";
import { saveUpload, removeUpload } from "@/lib/server/storage";
import { profileSchema, type ProfileInput } from "@/lib/schemas";
import { getAdminUserId } from "@/lib/server/site-data";

export async function updateProfileAction(input: ProfileInput) {
  await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const id = await getAdminUserId();
  await db
    .update(users)
    .set({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      city: parsed.data.city,
      locale: parsed.data.locale,
      bio: parsed.data.bio,
      longBio: parsed.data.longBio,
      socials: parsed.data.socials,
    })
    .where(eq(users.id, id));

  revalidatePath("/", "layout");
  return { ok: true as const };
}

const MAX_CV_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadCVAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "No file provided." };
  }
  if (file.size > MAX_CV_BYTES) {
    return { ok: false as const, error: "File too large (max 8 MB)." };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false as const, error: "Only PDF files are allowed." };
  }

  const id = await getAdminUserId();
  const [current] = await db
    .select({ cvUrl: users.cvUrl })
    .from(users)
    .where(eq(users.id, id));

  const saved = await saveUpload(file, "cv");
  await db
    .update(users)
    .set({
      cvUrl: saved.url,
      cvName: saved.name,
      cvSize: saved.size,
      cvUploadedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id));

  if (current?.cvUrl && current.cvUrl !== saved.url) {
    await removeUpload(current.cvUrl);
  }

  revalidatePath("/", "layout");
  return {
    ok: true as const,
    cv: {
      name: saved.name,
      size: saved.size,
      url: saved.url,
      uploadedAt: new Date().toISOString(),
    },
  };
}

export async function deleteCVAction() {
  await requireAdmin();
  const id = await getAdminUserId();
  const [current] = await db
    .select({ cvUrl: users.cvUrl })
    .from(users)
    .where(eq(users.id, id));

  if (current?.cvUrl) await removeUpload(current.cvUrl);

  await db
    .update(users)
    .set({ cvUrl: null, cvName: null, cvSize: null, cvUploadedAt: null })
    .where(eq(users.id, id));

  revalidatePath("/", "layout");
  return { ok: true as const };
}
