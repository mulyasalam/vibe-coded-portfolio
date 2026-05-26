import { db, messages } from "@/db";
import { desc } from "drizzle-orm";
import { MessagesInbox } from "@/components/admin/messages-inbox";

export default async function MessagesPage() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
  return (
    <main className="mx-auto max-w-[1280px] px-6 lg:px-10 py-12 lg:py-16">
      <div className="grid grid-cols-12 gap-6 items-end mb-12">
        <div className="col-span-12 md:col-span-8">
          <div className="mono-label text-ink/55 mb-3">◢ Inbox</div>
          <h1 className="display text-[56px] sm:text-[88px] leading-[0.92] tracking-tightest">
            The <span className="italic text-accent">post.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <div className="mono-label text-ink/55">Total</div>
          <div className="display italic text-[44px] leading-none">
            {String(rows.length).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="hairline mb-10" />

      <MessagesInbox initial={rows} />
    </main>
  );
}
