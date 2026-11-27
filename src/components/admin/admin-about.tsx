"use client";

import { useEffect, useState, type FormEvent } from "react";

const field = "mt-2 w-full rounded-[3px] border-2 border-black bg-surface px-3 py-3 text-sm";

export function AdminAbout() {
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState({ header: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to load about content."); return d; })
      .then((d) => { const next = { header: d?.header || "", body: d?.body || "" }; setHeader(next.header); setBody(next.body); setSaved(next); })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load about content."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setNotice(""); setSaving(true);
    try {
      const r = await fetch("/api/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ header, body }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to save.");
      const next = { header: d?.header || "", body: d?.body || "" }; setHeader(next.header); setBody(next.body); setSaved(next); setNotice(d ? "About section saved." : "About section removed from the shop page.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save."); }
    finally { setSaving(false); }
  }

  return <section className="mb-14 max-w-2xl border-b border-black/15 pb-10">
    <h2 className="mb-2 text-[11px] uppercase tracking-[0.18em]">Shop about section</h2>
    <p className="mb-5 text-[13px] text-black/60">Edit the content displayed on the Shop page. Clear both fields and save to hide the section.</p>
    {loading ? <p className="text-sm">Loading…</p> : <form onSubmit={submit} className="space-y-5">
      <label className="block text-[13px]">Header<input maxLength={160} value={header} onChange={(e) => setHeader(e.target.value)} className={field} /></label>
      <label className="block text-[13px]">Body<textarea maxLength={12000} rows={6} value={body} onChange={(e) => setBody(e.target.value)} className={field} /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}
      <button disabled={saving || (header === saved.header && body === saved.body) || (!!header.trim() !== !!body.trim())} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white disabled:bg-black/30">{saving ? "Saving…" : "Save about section"}</button>
    </form>}
  </section>;
}
