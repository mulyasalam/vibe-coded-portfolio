import { db, projects, messages } from "@/db";
import { asc, desc, isNull } from "drizzle-orm";
import { getSiteData } from "@/lib/server/site-data";
import { ProfileForm } from "@/components/admin/profile-form";
import { CVForm } from "@/components/admin/cv-form";
import { ProjectsManager } from "@/components/admin/projects-manager";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "cv", label: "CV" },
  { id: "projects", label: "Projects" },
];

export default async function AdminDashboard() {
  const data = await getSiteData();
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder));
  const unread = await db
    .select({ id: messages.id })
    .from(messages)
    .where(isNull(messages.readAt));
  const recent = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(1);

  return (
    <main className="mx-auto max-w-[1280px] px-6 lg:px-10 py-12 lg:py-16">
      <div className="grid grid-cols-12 gap-6 items-end mb-12">
        <div className="col-span-12 md:col-span-8">
          <div className="mono-label text-ink/55 mb-3">◢ Dashboard</div>
          <h1 className="display text-[56px] sm:text-[88px] leading-[0.92] tracking-tightest">
            Tend the <span className="italic text-accent">cover.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right space-y-1">
          <div className="mono-label text-ink/55">Index</div>
          <ul className="flex md:justify-end gap-4 mono-label text-ink/70">
            {tabs.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="hover:text-accent">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
        <Stat label="Projects" value={allProjects.length} />
        <Stat label="CV uploaded" value={data.cv ? "Yes" : "No"} />
        <Stat label="Unread messages" value={unread.length} accent={unread.length > 0} />
        <Stat
          label="Last message"
          value={
            recent[0]
              ? new Date(recent[0].createdAt).toLocaleDateString()
              : "—"
          }
        />
      </div>

      <div className="hairline mb-14" />

      <section id="profile" className="mb-24 scroll-mt-20">
        <SectionHead num="01" title="Profile" subtitle="Identity, bio, socials." />
        <ProfileForm initial={data.profile} />
      </section>

      <section id="cv" className="mb-24 scroll-mt-20">
        <SectionHead num="02" title="CV" subtitle="Upload your latest PDF." />
        <CVForm initial={data.cv} />
      </section>

      <section id="projects" className="mb-24 scroll-mt-20">
        <SectionHead
          num="03"
          title="Projects"
          subtitle="Add, edit, reorder, remove."
        />
        <ProjectsManager initial={allProjects} />
      </section>
    </main>
  );
}

function SectionHead({
  num,
  title,
  subtitle,
}: {
  num: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8 border-b border-ink/15 pb-4">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] text-ink/50">№ {num}</span>
        <h2 className="display text-[36px] sm:text-[48px] leading-none">
          {title}
        </h2>
      </div>
      <div className="mono-label text-ink/50 hidden sm:block">{subtitle}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="border border-ink/15 px-5 py-4">
      <div className="mono-label text-ink/55">{label}</div>
      <div
        className={`display italic text-[36px] leading-none mt-1 ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
