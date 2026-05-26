"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/server/auth";

const signInSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Please fill in both fields." };
  }
  const { username, password } = parsed.data;

  const expectedUser = "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) {
    return {
      ok: false as const,
      error: "Server not configured: ADMIN_PASSWORD missing.",
    };
  }

  if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPass)) {
    return { ok: false as const, error: "Wrong username or password." };
  }

  await createSession();
  return { ok: true as const };
}

export async function signOutAction() {
  await clearSession();
  redirect("/admin/login");
}
