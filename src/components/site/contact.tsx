"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Send,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Dribbble,
  Figma,
  Globe,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { useSiteData } from "@/components/site-data-provider";
import { submitContactAction } from "@/lib/actions/contact";

export function Contact() {
  const { profile } = useSiteData();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      subject: String(form.get("subject") || "").trim(),
      message: String(form.get("message") || "").trim(),
      hp: String(form.get("hp") || ""),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      toast.error("Please complete every field before sending.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      toast.error("That email doesn’t look quite right.");
      return;
    }

    setSubmitting(true);
    const res = await submitContactAction(payload);
    setSubmitting(false);

    if (res.ok) {
      setSent(true);
      toast.success("Message sent — I’ll be in touch within 48h.");
      formEl.reset();
      setTimeout(() => setSent(false), 4500);
    } else {
      toast.error(res.error || "Something went wrong. Try again?");
    }
  }

  return (
    <section id="contact" className="relative py-24 lg:py-32 paper-noise">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-7">
            <div className="mono-label text-ink/50 mb-3">
              § 03 / Correspondence
            </div>
            <h2 className="display text-[72px] sm:text-[120px] leading-[0.9] tracking-tightest">
              Send a <span className="italic text-accent">letter.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink/75 max-w-lg">
              For project briefs, studio collaborations, talks, or just a
              well-worded hello — fill in the form, or write directly to{" "}
              <a
                href={`mailto:${profile.email}`}
                className="link-underline text-ink"
              >
                {profile.email}
              </a>
              .
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 md:text-right space-y-2">
            <div className="mono-label text-ink/50">Reply time</div>
            <div className="display italic text-[44px] leading-none">~ 48h</div>
            <div className="mono-label text-ink/50 mt-4">Postmark</div>
            <div className="font-mono text-[12px]">Aachen · Germany</div>
          </div>
        </div>

        <div className="hairline mb-10" />

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-12 gap-x-8 gap-y-10"
        >
          <div className="col-span-12 md:col-span-4">
            <div className="mono-label text-ink/40">№ 01</div>
            <Label htmlFor="name" className="block mt-2">
              Name
            </Label>
            <Input id="name" name="name" placeholder="Your full name" />
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="mono-label text-ink/40">№ 02</div>
            <Label htmlFor="email" className="block mt-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@studio.com"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="mono-label text-ink/40">№ 03</div>
            <Label htmlFor="subject" className="block mt-2">
              Subject
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Editorial CMS for…"
            />
          </div>

          <div className="col-span-12">
            <div className="mono-label text-ink/40">№ 04</div>
            <Label htmlFor="message" className="block mt-2">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Tell me about your team, your timeline, and the smallest detail you care about."
            />
          </div>

          {/* Honeypot — hidden from humans, attractive to bots */}
          <div className="hidden" aria-hidden>
            <input type="text" name="hp" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="font-mono text-[11px] text-ink/55 max-w-sm">
              By sending this, you agree to be replied to politely and promptly.
              Not stored, not shared.
            </div>
            <div className="flex items-center gap-4">
              {sent && (
                <span className="mono-label text-accent">◢ message sent</span>
              )}
              <Button
                type="submit"
                variant="solid"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="size-1.5 bg-paper rounded-full animate-pulse" />
                    Sending
                  </>
                ) : (
                  <>
                    Send message <Send className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="hairline mt-20 mb-8" />

        {/* socials grid */}
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-4">
            <div className="mono-label text-ink/50 mb-2">Elsewhere</div>
            <h3 className="display text-[34px] leading-none italic">
              the rest of the internet.
            </h3>
          </div>
          <ul className="col-span-12 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.socials.map((s) => {
              const Icon = socialIcon(s.label);
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${s.label} — ${s.handle}`}
                    className="group block border border-ink/25 px-5 py-6 hover:bg-ink hover:text-paper transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <Icon
                        className="size-9 stroke-[1.4]"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      />
                      <ArrowUpRight className="size-3.5 opacity-40 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="mono-label mt-5">{s.label}</div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function socialIcon(label: string): LucideIcon {
  const k = label.toLowerCase();
  if (k.includes("linkedin")) return Linkedin;
  if (k.includes("github")) return Github;
  if (k.includes("instagram")) return Instagram;
  if (
    k.includes("twitter") ||
    k === "x" ||
    k.includes("x / ") ||
    k.startsWith("x")
  )
    return Twitter;
  if (k.includes("youtube")) return Youtube;
  if (k.includes("facebook")) return Facebook;
  if (k.includes("dribbble")) return Dribbble;
  if (k.includes("figma")) return Figma;
  if (k.includes("mail") || k.includes("email")) return Mail;
  return Globe;
}
