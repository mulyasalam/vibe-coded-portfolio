"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/actions/auth";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const res = await signInAction(null, formData);
      if (res?.ok) {
        toast.success("Welcome back.");
        router.push("/admin");
        router.refresh();
      } else {
        setError(res?.error ?? "Wrong credentials.");
        toast.error(res?.error ?? "Wrong credentials.");
      }
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 paper-noise">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mono-label text-ink/60 hover:text-accent mb-10"
        >
          <ArrowLeft className="size-3" /> Back to site
        </Link>

        <div className="mono-label text-ink/50 mb-3">◢ Admin / Sign in</div>
        <h1 className="display text-[64px] sm:text-[80px] leading-[0.9] tracking-tightest mb-2">
          The <span className="italic text-accent">backroom.</span>
        </h1>
        <p className="text-[14px] text-ink/65 mb-10 max-w-sm">
          A hidden panel for tending the cover, the projects, the inbox, and
          the CV. Default credentials in <span className="font-mono">.env.local</span>{" "}
          — <span className="font-mono">admin</span> /{" "}
          <span className="font-mono">admin</span>.
        </p>

        <form onSubmit={onSubmit} className="space-y-8">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="admin"
              defaultValue="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              defaultValue="admin"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="mono-label text-accent">◢ {error}</div>
          )}
          <Button type="submit" variant="solid" size="lg" disabled={pending}>
            <LockKeyhole className="size-3.5" />
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </form>

        <div className="mt-12 hairline pt-6 font-mono text-[11px] text-ink/55">
          Session signed via HS256, stored in an httpOnly cookie.
        </div>
      </div>
    </main>
  );
}
