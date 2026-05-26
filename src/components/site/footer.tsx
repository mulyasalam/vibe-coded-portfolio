"use client";

import { useSiteData } from "@/components/site-data-provider";

export function Footer() {
  const { profile } = useSiteData();
  return (
    <footer className="relative bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="mono-label opacity-50 mb-6">— Colophon</div>
            <p className="display text-[clamp(48px,8vw,128px)] leading-[0.9] tracking-tightest">
              <span className="italic">Thanks</span> for reading.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <div className="mono-label opacity-50 mb-2">Index</div>
            <ul className="space-y-1 text-[15px]">
              <li><a href="#top" className="link-underline">Cover</a></li>
              <li><a href="#work" className="link-underline">Selected Works</a></li>
              <li><a href="#contact" className="link-underline">Correspondence</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-paper/20 mt-16 pt-6 grid grid-cols-12 gap-6 font-mono text-[11px] opacity-70">
          <div className="col-span-6 md:col-span-3">© 2026 {profile.name}</div>
          <div className="col-span-6 md:col-span-3">{profile.city}</div>
          <div className="hidden md:block col-span-3">
            Set in Instrument Serif &amp; Geist
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            v26.1 · build {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>
    </footer>
  );
}
