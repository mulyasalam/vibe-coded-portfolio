"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbMessage } from "@/db";
import {
  markMessageReadAction,
  deleteMessageAction,
} from "@/lib/actions/messages";

export function MessagesInbox({ initial }: { initial: DbMessage[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null
  );
  const [pending, start] = useTransition();
  const selected = items.find((m) => m.id === selectedId) ?? null;

  function toggleRead(m: DbMessage) {
    const next = m.readAt ? false : true;
    start(async () => {
      await markMessageReadAction(m.id, next);
      setItems((xs) =>
        xs.map((x) =>
          x.id === m.id
            ? { ...x, readAt: next ? new Date().toISOString() : null }
            : x
        )
      );
      router.refresh();
    });
  }

  function remove(m: DbMessage) {
    if (!confirm("Delete this message?")) return;
    start(async () => {
      await deleteMessageAction(m.id);
      setItems((xs) => xs.filter((x) => x.id !== m.id));
      if (selectedId === m.id) {
        setSelectedId(items.find((x) => x.id !== m.id)?.id ?? null);
      }
      toast.success("Deleted.");
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-ink/25 px-6 py-16 text-center">
        <div className="display italic text-[40px] leading-none mb-3">
          Inbox empty.
        </div>
        <div className="mono-label text-ink/55">
          When visitors send messages via the contact form, they land here.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <ul className="col-span-12 md:col-span-5 divide-y divide-ink/15 border-t border-b border-ink/15">
        {items.map((m) => {
          const isSelected = selectedId === m.id;
          const unread = !m.readAt;
          return (
            <li key={m.id}>
              <button
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left px-3 py-4 flex items-start gap-3 transition-colors ${
                  isSelected ? "bg-ink text-paper" : "hover:bg-ink/[0.04]"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full mt-2 shrink-0 ${
                    unread ? "bg-accent" : "bg-transparent"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`mono-label ${
                        isSelected ? "text-paper/70" : "text-ink/70"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        isSelected ? "text-paper/60" : "text-ink/55"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="display italic text-[20px] leading-tight mt-1 truncate">
                    {m.subject}
                  </div>
                  <div
                    className={`text-[12px] mt-1 line-clamp-1 ${
                      isSelected ? "text-paper/70" : "text-ink/60"
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <article className="col-span-12 md:col-span-7 border border-ink/15 p-6 md:p-8 self-start">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="mono-label text-ink/55">
                  {new Date(selected.createdAt).toLocaleString()}
                </div>
                <h2 className="display text-[36px] sm:text-[44px] leading-tight mt-2">
                  {selected.subject}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRead(selected)}
                  disabled={pending}
                >
                  {selected.readAt ? (
                    <>
                      <Mail className="size-3" /> Unread
                    </>
                  ) : (
                    <>
                      <MailOpen className="size-3" /> Mark read
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(selected)}
                  disabled={pending}
                >
                  <Trash2 className="size-3" /> Delete
                </Button>
              </div>
            </div>

            <div className="border-t border-ink/15 pt-4 grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="mono-label text-ink/55">From</div>
                <div className="mt-1">{selected.name}</div>
              </div>
              <div>
                <div className="mono-label text-ink/55">Reply to</div>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
                    selected.subject
                  )}`}
                  className="mt-1 inline-flex items-center gap-1 link-underline"
                >
                  {selected.email} <ArrowUpRight className="size-3" />
                </a>
              </div>
            </div>

            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-ink/85">
              {selected.message}
            </p>
          </>
        ) : (
          <div className="text-ink/55 text-[14px]">Select a message.</div>
        )}
      </article>
    </div>
  );
}
