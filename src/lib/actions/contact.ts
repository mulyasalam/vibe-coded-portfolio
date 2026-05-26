"use server";

import crypto from "node:crypto";
import { db, messages } from "@/db";
import { contactSchema, type ContactInput } from "@/lib/schemas";

async function sendEmailNotification(input: ContactInput) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: input.email,
        subject: `[Portfolio] ${input.subject}`,
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      }),
    });
  } catch (err) {
    console.error("[contact] email failed:", err);
  }
}

export async function submitContactAction(input: ContactInput) {
  if (input.hp && input.hp.length > 0) {
    // Pretend success for bots.
    return { ok: true as const };
  }
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error:
        parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const id = `m_${crypto.randomBytes(5).toString("hex")}`;
  await db.insert(messages).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  await sendEmailNotification(parsed.data);
  return { ok: true as const };
}
