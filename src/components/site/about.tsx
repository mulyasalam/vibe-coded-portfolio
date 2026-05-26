"use client";

import { useSiteData } from "@/components/site-data-provider";

const numbers = [
  { v: "06", l: "Years in practice" },
  { v: "23", l: "Shipped products" },
  { v: "04", l: "Type specimens" },
  { v: "12", l: "Cities visited 2025" },
];

const tools = [
  "Figma · Origami",
  "Next.js · Remix",
  "TypeScript · Drizzle",
  "GSAP · Motion",
  "Sanity · Payload",
  "Pro / Capture One",
];

const principles = [
  "Read like a magazine, perform like a product.",
  "Detail is a function, not a finish.",
  "Quiet UI lets the work shout.",
  "Make the system, don’t style around it.",
];

export function About() {
  const { profile } = useSiteData();
  return (
    <section id="about" className="relative bg-ink text-paper py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-6 items-start mb-14">
          <div className="col-span-12 md:col-span-4">
            <div className="mono-label opacity-50 mb-3">§ 03 / Colophon</div>
            <h2 className="display text-[64px] sm:text-[96px] leading-[0.92] tracking-tightest">
              On <span className="italic text-accent">practice.</span>
            </h2>
          </div>

          <div className="col-span-12 md:col-span-5">
            <p className="text-[17px] leading-relaxed text-paper/85 max-w-md">
              {profile.longBio}
            </p>
            <p className="text-[15px] leading-relaxed text-paper/65 max-w-md mt-5">
              I work best as a small, embedded second — the engineer who reads
              the brand book, the designer who opens the terminal. If that
              sounds like you, let’s talk.
            </p>
          </div>

          <div className="col-span-12 md:col-span-3 md:text-right">
            <div className="mono-label opacity-50 mb-3">— Status</div>
            <div className="display italic text-[44px] leading-none text-accent">
              Open
            </div>
            <div className="font-mono text-[12px] opacity-70 mt-2">
              Two slots · Q3 2026
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-paper/20 pt-8">
          {numbers.map((n) => (
            <div key={n.l} className="border-l border-paper/15 pl-4">
              <div className="display italic text-[72px] leading-none">{n.v}</div>
              <div className="mono-label opacity-60 mt-2">{n.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 mt-20">
          <div className="col-span-12 md:col-span-6">
            <div className="mono-label opacity-50 mb-5">Stack of choice</div>
            <ul className="space-y-2">
              {tools.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between border-b border-paper/15 py-2 text-[15px]"
                >
                  <span>{t}</span>
                  <span className="font-mono text-[11px] opacity-50">daily</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="mono-label opacity-50 mb-5">Working principles</div>
            <ol className="space-y-5">
              {principles.map((p, i) => (
                <li key={p} className="grid grid-cols-[auto_1fr] gap-4 items-baseline">
                  <span className="font-mono text-[11px] opacity-50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[26px] sm:text-[30px] leading-tight">
                    {p}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
