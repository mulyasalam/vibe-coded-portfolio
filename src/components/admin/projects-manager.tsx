"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { DbProject } from "@/db";
import type { ProjectInput } from "@/lib/schemas";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  reorderProjectsAction,
  uploadProjectImageAction,
} from "@/lib/actions/projects";
import {
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";

function toInput(p: DbProject): ProjectInput {
  return {
    title: p.title,
    client: p.client,
    category: p.category,
    year: p.year,
    linkUrl: p.linkUrl,
    imageUrl: p.imageUrl,
    techStack: p.techStack ?? [],
    summary: p.summary,
  };
}

function blankDraft(): ProjectInput {
  return {
    title: "Untitled project",
    client: "",
    category: "Misc",
    year: new Date().getFullYear(),
    linkUrl: "",
    imageUrl: "",
    techStack: [],
    summary: "",
  };
}

export function ProjectsManager({ initial }: { initial: DbProject[] }) {
  const router = useRouter();
  const [items, setItems] = useState<DbProject[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ProjectInput | null>(null);
  const [techText, setTechText] = useState("");
  const [pending, start] = useTransition();

  // Follow server state when router.refresh() swaps in new data.
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setDraft(blankDraft());
    setTechText("");
  }

  function startEdit(p: DbProject) {
    setCreating(false);
    setEditingId(p.id);
    setDraft(toInput(p));
    setTechText((p.techStack ?? []).join(", "));
  }

  function cancel() {
    setEditingId(null);
    setCreating(false);
    setDraft(null);
    setTechText("");
  }

  function parseTech(s: string) {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function updateDraft<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("A project needs a title.");
      return;
    }
    const finalDraft: ProjectInput = {
      ...draft,
      techStack: parseTech(techText),
    };
    start(async () => {
      try {
        const res = creating
          ? await createProjectAction(finalDraft)
          : await updateProjectAction(editingId!, finalDraft);
        if (res.ok) {
          toast.success(creating ? "Project added." : "Project saved.");
          cancel();
          router.refresh();
        } else {
          toast.error(res.error ?? "Couldn’t save.");
        }
      } catch (err) {
        console.error("[saveDraft]", err);
        toast.error("Server error — check the console.");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this project? This can’t be undone.")) return;
    start(async () => {
      const res = await deleteProjectAction(id);
      if (res.ok) {
        setItems((xs) => xs.filter((p) => p.id !== id));
        if (editingId === id) cancel();
        toast.success("Project removed.");
        router.refresh();
      }
    });
  }

  function move(id: string, dir: -1 | 1) {
    const i = items.findIndex((p) => p.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    start(async () => {
      await reorderProjectsAction(next.map((p) => p.id));
      router.refresh();
    });
  }

  function onImagePick(file: File) {
    if (!draft) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10 MB). Try compressing it first.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      try {
        const res = await uploadProjectImageAction(fd);
        if (res.ok) {
          updateDraft("imageUrl", res.url);
          toast.success("Image uploaded.");
        } else {
          toast.error(res.error || "Upload failed.");
        }
      } catch (err) {
        console.error("[uploadProjectImage]", err);
        toast.error(
          "Upload failed — the file may be too large or the server is offline."
        );
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="mono-label text-ink/55">
          {items.length} project{items.length === 1 ? "" : "s"}
        </div>
        <Button variant="accent" onClick={startCreate} disabled={pending || creating}>
          <Plus className="size-3.5" /> New project
        </Button>
      </div>

      {creating && draft && (
        <div className="border border-ink/30 bg-ink/[0.02] p-4 mb-4">
          <div className="mono-label text-accent mb-3">◢ New project draft</div>
          <Editor
            draft={draft}
            update={updateDraft}
            techText={techText}
            setTechText={setTechText}
            onImagePick={onImagePick}
            onCancel={cancel}
            onSave={saveDraft}
            pending={pending}
            isNew
          />
        </div>
      )}

      <ul className="divide-y divide-ink/15 border-t border-b border-ink/20">
        {items.length === 0 && !creating && (
          <li className="py-10 text-center text-ink/55 text-[14px]">
            No projects yet. Hit “New project” to add the first one.
          </li>
        )}

        {items.map((p, idx) => {
          const isEditing = editingId === p.id && draft;
          return (
            <li key={p.id} className="py-3">
              <div className="grid grid-cols-12 items-center gap-3 px-1">
                <span className="col-span-1 font-mono text-[12px] text-ink/55">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="col-span-5 sm:col-span-4 min-w-0">
                  <div className="display italic text-[22px] sm:text-[26px] leading-none truncate">
                    {p.title}
                  </div>
                  <div className="font-mono text-[11px] text-ink/55 mt-1 truncate">
                    {p.client || "—"} · {p.category} · ’{String(p.year).slice(2)}
                  </div>
                </div>
                <div className="hidden md:flex col-span-3 flex-wrap gap-1">
                  {(p.techStack ?? []).slice(0, 4).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                  {(p.techStack ?? []).length > 4 && (
                    <span className="font-mono text-[10px] text-ink/55">
                      +{(p.techStack ?? []).length - 4}
                    </span>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4 md:col-span-4 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(p.id, -1)}
                    disabled={pending || idx === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(p.id, 1)}
                    disabled={pending || idx === items.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (isEditing ? cancel() : startEdit(p))}
                    disabled={pending && !isEditing}
                  >
                    {isEditing ? "Close" : "Edit"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(p.id)}
                    disabled={pending}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {isEditing && draft && (
                <div className="mt-5 border-t border-ink/10 pt-6 grid grid-cols-12 gap-x-6 gap-y-6 bg-ink/[0.02] px-3 pb-6">
                  <Editor
                    draft={draft}
                    update={updateDraft}
                    techText={techText}
                    setTechText={setTechText}
                    onImagePick={onImagePick}
                    onCancel={cancel}
                    onSave={saveDraft}
                    pending={pending}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Editor({
  draft,
  update,
  techText,
  setTechText,
  onImagePick,
  onCancel,
  onSave,
  pending,
  isNew = false,
}: {
  draft: ProjectInput;
  update: <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => void;
  techText: string;
  setTechText: (s: string) => void;
  onImagePick: (file: File) => void;
  onCancel: () => void;
  onSave: () => void;
  pending: boolean;
  isNew?: boolean;
}) {
  return (
    <>
      <div className="col-span-12 md:col-span-5">
        <Label>Preview image</Label>
        <label className="mt-2 block border border-dashed border-ink/30 aspect-[4/3] relative cursor-pointer hover:border-ink overflow-hidden bg-chip">
          {draft.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/50">
              <ImageIcon className="size-6 mb-2" />
              <span className="mono-label">click to upload</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImagePick(f);
            }}
          />
        </label>
        <div className="font-mono text-[10px] text-ink/50 mt-2">
          Or paste an image URL below.
        </div>
        <Input
          className="mt-1"
          placeholder="https://…/image.jpg"
          value={draft.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
        />
      </div>

      <div className="col-span-12 md:col-span-7 grid grid-cols-12 gap-x-4 gap-y-5">
        <div className="col-span-12 sm:col-span-8">
          <Label>Title</Label>
          <Input value={draft.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-4">
          <Label>Year</Label>
          <Input
            type="number"
            value={draft.year}
            onChange={(e) => update("year", Number(e.target.value) || 0)}
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <Label>Client</Label>
          <Input value={draft.client} onChange={(e) => update("client", e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <Label>Category</Label>
          <Input
            value={draft.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>
        <div className="col-span-12">
          <Label>Link URL</Label>
          <Input
            value={draft.linkUrl}
            onChange={(e) => update("linkUrl", e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="col-span-12">
          <Label>Tech stack (comma separated)</Label>
          <Input
            value={techText}
            onChange={(e) => setTechText(e.target.value)}
            placeholder="Next.js, Tailwind, …"
          />
          {techText.trim().length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {techText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center px-2 py-[3px] mono-label !text-[9.5px] !tracking-[0.2em] leading-none border border-ink/30"
                  >
                    {t}
                  </span>
                ))}
            </div>
          )}
        </div>
        <div className="col-span-12">
          <Label>Summary</Label>
          <Textarea
            rows={3}
            value={draft.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </div>

        <div className="col-span-12 flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="solid" size="sm" onClick={onSave} disabled={pending}>
            <Save className="size-3" /> {pending ? "Saving" : isNew ? "Add project" : "Save project"}
          </Button>
        </div>
      </div>
    </>
  );
}
