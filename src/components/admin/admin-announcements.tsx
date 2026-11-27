"use client";

import { useEffect, useState, type FormEvent } from "react";

type Announcement = { id: string; title: string; imageUrl: string; body: string; createdAt: string };
const input = "mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-sm";
const textarea = "mt-2 w-full rounded-[3px] border-2 border-black bg-surface px-3 py-3 text-sm";

export function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh() {
    const r = await fetch("/api/announcements", { cache: "no-store" });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to load announcements.");
    setItems(d);
  }
  useEffect(() => { refresh().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be 10 MB or smaller."); return; }
    setError(""); setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const r = await fetch("/api/admin/images", { method: "POST", body: form });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Upload failed.");
      setImageUrl(d.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  function reset() { setEditing(null); setTitle(""); setImageUrl(""); setBody(""); setNotice(""); }

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const url = editing ? `/api/announcements/${editing}` : "/api/announcements";
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, imageUrl, body }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to save announcement.");
      await refresh(); reset(); setNotice(editing ? "Announcement updated." : "Announcement created.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save announcement."); }
    finally { setSaving(false); }
  }

  function edit(item: Announcement) { setEditing(item.id); setTitle(item.title); setImageUrl(item.imageUrl); setBody(item.body); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function remove(id: string) {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setError(""); setNotice("");
    try {
      const r = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to delete announcement.");
      setItems((current) => current.filter((item) => item.id !== id)); setNotice("Announcement deleted.");
      if (editing === id) reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete announcement."); }
  }

  return <>
    <h1 className="text-sm uppercase tracking-[0.18em]">Announcements</h1>
    <p className="mb-8 mt-2 text-[13px] text-black/60">Create and manage the announcements displayed on the public Announcement page. Cover photos are uploaded to Cloudinary.</p>
    <form onSubmit={submit} className="max-w-2xl space-y-5 border-b border-black/15 pb-10">
      <h2 className="text-[11px] uppercase tracking-[0.18em]">{editing ? "Edit announcement" : "New announcement"}</h2>
      <label className="block text-[13px]">Title<input required maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} className={input} /></label>
      <div>
        <label className="block text-[13px]">Header / cover photo URL<input required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={input} /></label>
        <label className="mt-3 inline-flex cursor-pointer border-2 border-black px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white">{uploading ? "Uploading…" : "Upload cover photo"}<input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
        <p className="mt-2 text-xs text-black/50">Image files up to 10 MB.</p>
        {imageUrl && <div className="mt-4 aspect-video max-w-lg bg-surface">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageUrl} alt="Announcement cover preview" className="h-full w-full object-cover" /></div>}
      </div>
      <label className="block text-[13px]">Body<textarea required rows={9} maxLength={30000} value={body} onChange={(e) => setBody(e.target.value)} className={textarea} /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}
      <div className="flex flex-wrap gap-3">
        <button disabled={saving || uploading} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white disabled:bg-black/30">{saving ? "Saving…" : editing ? "Save changes" : "Publish announcement"}</button>
        {editing && <button type="button" onClick={reset} className="h-11 border-2 border-black px-6 text-xs uppercase tracking-[0.2em]">Cancel</button>}
      </div>
    </form>
    <section className="mt-10">
      <h2 className="text-[11px] uppercase tracking-[0.18em]">Published announcements ({items.length})</h2>
      {loading ? <p className="mt-4 text-sm">Loading…</p> : items.length === 0 ? <p className="mt-4 text-sm text-black/60">No announcements yet.</p> : <ul className="mt-4 divide-y divide-black/15 border-y border-black/15">
        {items.map((item) => <li key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <div className="aspect-video w-full shrink-0 bg-surface sm:w-36">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.imageUrl} alt="" className="h-full w-full object-cover" /></div>
          <div className="min-w-0 flex-1"><p className="text-sm uppercase">{item.title}</p><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-black/60">{item.body}</p></div>
          <div className="flex shrink-0 gap-4 text-xs"><button type="button" onClick={() => edit(item)} className="underline underline-offset-4">Edit</button><button type="button" onClick={() => remove(item.id)} className="text-red-600 underline underline-offset-4">Delete</button></div>
        </li>)}
      </ul>}
    </section>
  </>;
}
