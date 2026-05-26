import { z } from "zod";

export const socialSchema = z.object({
  label: z.string().trim().min(1).max(40),
  handle: z.string().trim().min(1).max(80),
  href: z.string().trim().url(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  role: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  locale: z.string().trim().min(1).max(40),
  bio: z.string().trim().min(1).max(500),
  longBio: z.string().trim().min(1).max(2000),
  socials: z.array(socialSchema).max(12),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  id: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(1).max(120),
  client: z.string().trim().max(120).default(""),
  category: z.string().trim().max(80).default(""),
  year: z.coerce.number().int().min(1990).max(2100),
  linkUrl: z.string().trim().max(500).default(""),
  imageUrl: z.string().trim().max(2000).default(""),
  techStack: z.array(z.string().trim().min(1)).max(20),
  summary: z.string().trim().max(1000).default(""),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(4).max(4000),
  hp: z.string().max(0).optional(), // honeypot
});
export type ContactInput = z.infer<typeof contactSchema>;
