"use client";

import { Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/components/site-data-provider";

export function Hero() {
  const { profile, cv } = useSiteData();
  const cvHref = cv?.url ?? profile.cv;

  return (
    <section
      id="top"
      className="relative pt-36 pb-20 lg:pt-44 lg:pb-28 paper-noise"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="mono-label text-ink/55 mb-8">
          ◢ {profile.role} · {profile.city}
        </div>

        <h1 className="display text-[clamp(56px,11vw,196px)] tracking-tightest text-balance">
          <span className="italic text-accent">Vibe</span> coded.
          <br />
          Hand finished.
        </h1>

        <div className="mt-10 grid grid-cols-12 gap-6 items-end">
          <p className="col-span-12 md:col-span-7 text-[17px] sm:text-[19px] leading-relaxed text-ink/80 max-w-2xl">
            I’m{" "}
            <span className="display italic text-[22px] text-ink">
              {profile.name}
            </span>
            . {profile.bio}
          </p>

          <div className="col-span-12 md:col-span-5 flex flex-wrap gap-3 md:justify-end">
            <Button asChild variant="accent">
              <a href={cvHref} download={cv?.name ?? true}>
                <Download className="size-3.5" /> Download CV
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#contact">
                Get in touch <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
