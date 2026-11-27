import type { Metadata } from "next";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";

export const metadata: Metadata = { title: "Announcement" };

export default async function AnnouncementPage() {
  await ensureSchema();
  const { rows } = await getPool().query(
    "SELECT id,title,image_url,body,created_at FROM announcements WHERE published=TRUE ORDER BY created_at DESC"
  );

  return (
    <section>
      <header className="mb-10 text-center">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em]">Announcements</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-black/50">News and updates from Hustlin</p>
      </header>
      {rows.length === 0 ? (
        <p className="py-20 text-center text-sm text-black/50">No announcements at the moment. Check back soon.</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-14">
          {rows.map((item) => (
            <article key={item.id}>
              <div className="aspect-[16/9] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-6 text-xl font-medium uppercase tracking-wide md:text-2xl">{item.title}</h2>
              <p className="mt-2 text-xs text-black/45">{new Date(item.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/75">{item.body}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
