"use server";

import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { db, projects } from "@/db";
import { requireAdmin } from "@/lib/server/auth";
import { saveUpload, removeUpload } from "@/lib/server/storage";
import { projectSchema, type ProjectInput } from "@/lib/schemas";
import { getAdminUserId } from "@/lib/server/site-data";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function listProjectsAction() {
  await requireAdmin();
  return db.select().from(projects).orderBy(asc(projects.sortOrder));
}

export async function createProjectAction(input: ProjectInput) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const id = `p_${crypto.randomBytes(5).toString("hex")}`;
  const userId = await getAdminUserId();
  const [{ max }] = (await db
    .select({ max: sql<number>`COALESCE(MAX(${projects.sortOrder}), -1)` })
    .from(projects)) as { max: number }[];

  await db.insert(projects).values({
    id,
    userId,
    title: parsed.data.title,
    client: parsed.data.client,
    category: parsed.data.category,
    year: parsed.data.year,
    linkUrl: parsed.data.linkUrl,
    imageUrl: parsed.data.imageUrl,
    techStack: parsed.data.techStack,
    summary: parsed.data.summary,
    sortOrder: (max ?? -1) + 1,
  });

  revalidatePath("/", "layout");
  return { ok: true as const, id };
}

export async function updateProjectAction(id: string, input: ProjectInput) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  await db
    .update(projects)
    .set({
      title: parsed.data.title,
      client: parsed.data.client,
      category: parsed.data.category,
      year: parsed.data.year,
      linkUrl: parsed.data.linkUrl,
      imageUrl: parsed.data.imageUrl,
      techStack: parsed.data.techStack,
      summary: parsed.data.summary,
    })
    .where(eq(projects.id, id));

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const [row] = await db
    .select({ imageUrl: projects.imageUrl })
    .from(projects)
    .where(eq(projects.id, id));
  if (row?.imageUrl) await removeUpload(row.imageUrl);
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function reorderProjectsAction(orderedIds: string[]) {
  await requireAdmin();
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(projects)
      .set({ sortOrder: i })
      .where(eq(projects.id, orderedIds[i]));
  }
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function uploadProjectImageAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "No file provided." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false as const, error: "Image too large (max 10 MB)." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false as const, error: "Only image files are allowed." };
  }
  const saved = await saveUpload(file, "image");
  return { ok: true as const, url: saved.url };
}
