"use client";

import { useEffect, useState } from "react";
import { useSiteData } from "@/components/site-data-provider";
import { cn } from "@/lib/utils";

const links = [
  { label: "Index", href: "#index" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const { profile } = useSiteData();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/Berlin",
          hour12: false,
        }).format(new Date())
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-paper/80 backdrop-blur-sm border-b border-ink/15">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-14 flex items-center justify-between">
        <a href="#top" className="flex items-baseline gap-3 group">
          <span className="display text-[22px] leading-none italic">
            {profile.name.split(" ")[0]}
          </span>
          <span className="mono-label text-ink/50 group-hover:text-accent transition-colors">
            ◢ vibe coded ’26
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mono-label text-ink/70 hover:text-accent transition-colors"
            >
              {l.label.toLowerCase()}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden sm:flex mono-label text-ink/60">
            {profile.city} · {time || "00:00:00"} {profile.locale}
          </span>
          <a
            href="#contact"
            className={cn(
              "mono-label inline-flex items-center gap-2 border border-ink px-3 py-2",
              "hover:bg-ink hover:text-paper transition-colors"
            )}
          >
            <span className="size-1.5 bg-accent rounded-full animate-pulse" />
            Available
          </a>
        </div>
      </div>
    </header>
  );
}
