"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db, messages } from "@/db";
import { requireAdmin } from "@/lib/server/auth";

export async function listMessagesAction() {
  await requireAdmin();
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessageReadAction(id: string, read: boolean) {
  await requireAdmin();
  await db
    .update(messages)
    .set({ readAt: read ? new Date().toISOString() : null })
    .where(eq(messages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true as const };
}

export async function deleteMessageAction(id: string) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true as const };
}
