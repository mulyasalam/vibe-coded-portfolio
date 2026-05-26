"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ProfileInput } from "@/lib/schemas";
import { Save, Plus, X } from "lucide-react";

type Initial = ProfileInput & { shortName?: string; cv?: string };

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInput>({
    name: initial.name,
    email: initial.email,
    role: initial.role,
    city: initial.city,
    locale: initial.locale,
    bio: initial.bio,
    longBio: initial.longBio,
    socials: initial.socials,
  });
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  function updateSocial(i: number, key: "label" | "handle" | "href", value: string) {
    setProfile((p) => {
      const next = [...p.socials];
      next[i] = { ...next[i], [key]: value };
      return { ...p, socials: next };
    });
    setDirty(true);
  }

  function addSocial() {
    setProfile((p) => ({
      ...p,
      socials: [...p.socials, { label: "New", handle: "@", href: "https://" }],
    }));
    setDirty(true);
  }

  function removeSocial(i: number) {
    setProfile((p) => ({
      ...p,
      socials: p.socials.filter((_, j) => j !== i),
    }));
    setDirty(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfileAction(profile);
      if (res?.ok) {
        setDirty(false);
        toast.success("Profile saved.");
        router.refresh();
      } else {
        toast.error(res?.error ?? "Couldn’t save.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-x-8 gap-y-10">
      <Field className="col-span-12 md:col-span-6" label="Name" num="01">
        <Input value={profile.name} onChange={(e) => update("name", e.target.value)} />
      </Field>
      <Field className="col-span-12 md:col-span-6" label="Role" num="02">
        <Input value={profile.role} onChange={(e) => update("role", e.target.value)} />
      </Field>
      <Field className="col-span-12 md:col-span-4" label="City" num="03">
        <Input value={profile.city} onChange={(e) => update("city", e.target.value)} />
      </Field>
      <Field className="col-span-12 md:col-span-4" label="Timezone" num="04">
        <Input value={profile.locale} onChange={(e) => update("locale", e.target.value)} />
      </Field>
      <Field className="col-span-12 md:col-span-4" label="Email" num="05">
        <Input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
      </Field>
      <Field className="col-span-12" label="Short bio (hero)" num="06">
        <Textarea rows={2} value={profile.bio} onChange={(e) => update("bio", e.target.value)} />
      </Field>
      <Field className="col-span-12" label="Long bio (about / future use)" num="07">
        <Textarea rows={4} value={profile.longBio} onChange={(e) => update("longBio", e.target.value)} />
      </Field>

      <div className="col-span-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="mono-label text-ink/40">№ 08</div>
            <Label className="mt-1 block">Socials</Label>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSocial}>
            <Plus className="size-3" /> Add
          </Button>
        </div>

        <ul className="divide-y divide-ink/15 border-t border-b border-ink/15">
          {profile.socials.map((s, i) => (
            <li key={i} className="grid grid-cols-12 gap-3 items-center py-3">
              <Input
                className="col-span-3 !py-2 !border-b-0"
                value={s.label}
                placeholder="Label"
                onChange={(e) => updateSocial(i, "label", e.target.value)}
              />
              <Input
                className="col-span-3 !py-2 !border-b-0"
                value={s.handle}
                placeholder="@handle"
                onChange={(e) => updateSocial(i, "handle", e.target.value)}
              />
              <Input
                className="col-span-5 !py-2 !border-b-0"
                value={s.href}
                placeholder="https://"
                onChange={(e) => updateSocial(i, "href", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                className="col-span-1 inline-flex justify-end text-ink/40 hover:text-accent"
                aria-label="Remove"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-12 flex items-center justify-between pt-2">
        <div className="mono-label text-ink/50">
          {dirty ? "◢ unsaved changes" : pending ? "◢ saving…" : "◦ all saved"}
        </div>
        <Button type="submit" variant="solid" disabled={!dirty || pending}>
          <Save className="size-3.5" />
          {pending ? "Saving" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  className = "",
  label,
  num,
  children,
}: {
  className?: string;
  label: string;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mono-label text-ink/40">№ {num}</div>
      <Label className="mt-1 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
