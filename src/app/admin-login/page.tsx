"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export default function AdminLoginPage() {
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error || "Sign in failed."); router.replace("/admin"); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Sign in failed."); } finally { setBusy(false); } }
  return <main className="mx-auto max-w-sm px-6 py-24"><h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Admin sign in</h1><form onSubmit={submit} className="space-y-5"><label className="block text-[13px]">Password<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button></form></main>;
}
