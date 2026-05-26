"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSiteData } from "@/components/site-data-provider";

export function Projects() {
  const { projects } = useSiteData();

  return (
    <section id="work" className="relative pt-24 pb-24 lg:pt-32 lg:pb-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        {/* Section masthead */}
        <div className="grid grid-cols-12 gap-6 items-end mb-12">
          <div className="col-span-12 md:col-span-4">
            <div className="mono-label text-ink/50 mb-3">
              § 02 / Selected Works
            </div>
            <h2 className="display text-[64px] sm:text-[88px] leading-[0.92] tracking-tightest">
              The <span className="italic">index.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="text-[15px] leading-relaxed text-ink/75 max-w-md">
              Pieces I keep returning to — most vibe coded in a sitting or two,
              shaped through prompts, finished by hand. Each one shipped.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            <div className="mono-label text-ink/50">Total entries</div>
            <div className="display italic text-[64px] leading-none">
              {String(projects.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div id="index" className="hairline mb-2" />

        {/* Index list view */}
        <ul className="font-mono text-[12px] text-ink/70 grid grid-cols-12 px-1 py-3 border-b border-ink/20">
          <li className="col-span-1 mono-label">№</li>
          <li className="col-span-5 sm:col-span-4 mono-label">Project</li>
          <li className="hidden sm:block col-span-3 mono-label">Client</li>
          <li className="col-span-3 sm:col-span-2 mono-label">Category</li>
          <li className="col-span-3 sm:col-span-2 mono-label text-right">Year</li>
        </ul>
        <ul className="divide-y divide-ink/15 mb-20">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={p.href || "#"}
                target="_blank"
                className="group grid grid-cols-12 items-center px-1 py-4 hover:bg-ink hover:text-paper transition-colors"
              >
                <span className="col-span-1 font-mono text-[12px] opacity-60">
                  {p.index}
                </span>
                <span className="col-span-5 sm:col-span-4 display italic text-[24px] sm:text-[28px] leading-none">
                  {p.title}
                  <ArrowUpRight className="inline-block size-4 ml-2 -translate-y-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-2 transition-transform" />
                </span>
                <span className="hidden sm:block col-span-3 font-mono text-[12px] opacity-70">
                  {p.client}
                </span>
                <span className="col-span-3 sm:col-span-2 font-mono text-[12px] opacity-70">
                  {p.category}
                </span>
                <span className="col-span-3 sm:col-span-2 font-mono text-[12px] opacity-70 text-right">
                  ’{String(p.year).slice(2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Card grid view */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mono-label text-ink/50 mb-2">View</div>
            <h3 className="display text-[40px] leading-none">
              <span className="italic">In</span> the open.
            </h3>
          </div>
          <div className="mono-label text-ink/50 hidden sm:block">
            scroll ↓ / hover for preview
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 gap-y-16">
          {projects.map((p, i) => {
            const span =
              i % 4 === 0
                ? "col-span-12 md:col-span-7"
                : i % 4 === 1
                ? "col-span-12 md:col-span-5"
                : i % 4 === 2
                ? "col-span-12 md:col-span-5"
                : "col-span-12 md:col-span-7";
            const offset = i % 4 === 2 ? "md:mt-16" : "";
            return (
              <article key={p.id} className={`${span} ${offset} group`}>
                <Link href={p.href || "#"} target="_blank" className="block">
                  <div className="relative overflow-hidden border border-ink/20 bg-chip">
                    <div className="absolute z-10 top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                      <span className="mono-label bg-paper/85 text-ink px-2 py-1 backdrop-blur-sm">
                        {p.index} · {p.category}
                      </span>
                      <span className="mono-label bg-paper/85 text-ink px-2 py-1 backdrop-blur-sm">
                        ’{String(p.year).slice(2)}
                      </span>
                    </div>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.title}
                        className="block w-full h-auto transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="aspect-[4/3] flex items-center justify-center text-ink/40 font-mono text-[11px]">
                        no preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors pointer-events-none" />
                  </div>

                  <div className="pt-5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="display text-[34px] sm:text-[40px] leading-none">
                        {p.title}
                        <span className="text-accent italic"> ↗</span>
                      </h4>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-ink/70 max-w-md">
                        {p.summary}
                      </p>
                    </div>
                    <div className="font-mono text-[11px] text-ink/55 text-right shrink-0">
                      {p.client}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
