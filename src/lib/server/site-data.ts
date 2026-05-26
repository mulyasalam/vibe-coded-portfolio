import "server-only";
import { db, users, projects as projectsTbl } from "@/db";
import { asc } from "drizzle-orm";
import {
  profile as defaultProfile,
  projects as defaultProjects,
  type Project,
} from "@/lib/data";

export type SiteCV = {
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
} | null;

export type SiteData = {
  profile: typeof defaultProfile;
  projects: Project[];
  cv: SiteCV;
};

export async function getSiteData(): Promise<SiteData> {
  try {
    const [u] = await db.select().from(users).limit(1);
    if (!u) {
      return { profile: defaultProfile, projects: defaultProjects, cv: null };
    }

    const rows = await db
      .select()
      .from(projectsTbl)
      .orderBy(asc(projectsTbl.sortOrder));

    const profile = {
      name: u.name,
      shortName:
        u.name
          .split(/\s+/)
          .map((s: string) => s[0])
          .join(".") + ".",
      role: u.role,
      city: u.city,
      locale: u.locale,
      bio: u.bio,
      longBio: u.longBio,
      cv: u.cvUrl ?? "/cv.pdf",
      email: u.email,
      socials: u.socials ?? [],
    };

    const mappedProjects: Project[] = rows.map((p, i) => ({
      id: p.id,
      index: String(i + 1).padStart(2, "0"),
      title: p.title,
      client: p.client,
      year: p.year,
      category: p.category,
      href: p.linkUrl,
      image: p.imageUrl,
      tech: p.techStack ?? [],
      summary: p.summary,
    }));

    const cv: SiteCV = u.cvUrl
      ? {
          name: u.cvName ?? "cv.pdf",
          size: u.cvSize ?? 0,
          uploadedAt: u.cvUploadedAt ?? "",
          url: u.cvUrl,
        }
      : null;

    return { profile, projects: mappedProjects, cv };
  } catch (err) {
    console.error("[getSiteData] falling back to defaults:", err);
    return { profile: defaultProfile, projects: defaultProjects, cv: null };
  }
}

export async function getAdminUserId(): Promise<string> {
  const [u] = await db.select({ id: users.id }).from(users).limit(1);
  if (!u) throw new Error("No admin user seeded.");
  return u.id;
}
