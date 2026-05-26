"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadCVAction, deleteCVAction } from "@/lib/actions/profile";
import type { SiteCV } from "@/lib/server/site-data";
import { Upload, FileText, Trash2 } from "lucide-react";

export function CVForm({ initial }: { initial: SiteCV }) {
  const router = useRouter();
  const [cv, setCV] = useState<SiteCV>(initial);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please choose a PDF.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      const res = await uploadCVAction(fd);
      if (res.ok) {
        setCV(res.cv);
        toast.success("CV uploaded.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function clear() {
    if (!confirm("Remove the uploaded CV?")) return;
    start(async () => {
      const res = await deleteCVAction();
      if (res.ok) {
        setCV(null);
        toast.success("CV removed.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      <div className="col-span-12 md:col-span-7">
        <label className="block border border-dashed border-ink/30 px-6 py-12 text-center cursor-pointer hover:border-ink hover:bg-ink/[0.03] transition-colors">
          <Upload className="size-5 mx-auto text-ink/60" />
          <div className="display italic text-[28px] mt-4">
            {pending ? "Uploading…" : "Drop your PDF."}
          </div>
          <div className="mono-label text-ink/50 mt-2">
            click to choose · max 8 MB
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={pending}
            onChange={onPick}
          />
        </label>
      </div>

      <div className="col-span-12 md:col-span-5">
        <div className="mono-label text-ink/50 mb-3">Current file</div>
        {cv ? (
          <div className="border border-ink/20 p-5">
            <div className="flex items-start gap-3">
              <FileText className="size-5 text-ink/70 mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="display italic text-[22px] truncate">{cv.name}</div>
                <div className="font-mono text-[11px] text-ink/55 mt-1">
                  {(cv.size / 1024).toFixed(0)} KB · uploaded{" "}
                  {cv.uploadedAt
                    ? new Date(cv.uploadedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button asChild variant="outline" size="sm">
                <a href={cv.url} download={cv.name} target="_blank" rel="noreferrer">
                  Download
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                disabled={pending}
              >
                <Trash2 className="size-3" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-ink/15 p-5 text-ink/55 text-[14px]">
            No CV uploaded. The “Download CV” button on the landing page will
            link to <span className="font-mono text-[12px]">/cv.pdf</span> until
            you upload one here.
          </div>
        )}
      </div>
    </div>
  );
}
