"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Inbox" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, start] = useTransition();

  if (pathname?.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-ink/15">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="display italic text-[22px] leading-none">
              Admin
            </span>
            <nav className="hidden sm:flex items-center gap-4 mono-label text-ink/60">
              {tabs.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={active ? "text-accent" : "hover:text-ink"}
                  >
                    {t.label.toLowerCase()}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                View site <ExternalLink className="size-3" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => start(async () => signOutAction())}
            >
              <LogOut className="size-3" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
