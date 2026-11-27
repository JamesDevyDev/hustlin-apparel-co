"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getSettings,
  isValidImageLink,
  updateSettings,
} from "@/lib/services/settings-service";

const input =
  "mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base font-light";

export function AdminSettings() {
  const [saved, setSaved] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [previewBroken, setPreviewBroken] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    getSettings()
      .then((s) => {
        if (cancelled) return;

        const safeQrUrl = typeof s?.qrUrl === "string" ? s.qrUrl : "";

        setSaved(safeQrUrl);
        setQrUrl(safeQrUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = (qrUrl ?? "").trim();
  const previewable = isValidImageLink(trimmed);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!isValidImageLink(trimmed)) {
      return setError("QR link must start with https:// (or / for a file in /public).");
    }
    setSaving(true);
    try {
      const s = await updateSettings({ qrUrl: trimmed });
      setSaved(s.qrUrl);
      setQrUrl(s.qrUrl);
      setNotice("Saved. Checkout now shows this QR code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault(); setPasswordError(""); setPasswordNotice("");
    if (newPassword !== confirmPassword) return setPasswordError("New password and confirmation do not match.");
    setPasswordSaving(true);
    try {
      const response = await fetch("/api/admin/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword, newPassword, confirmPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to change password.");
      setPasswordNotice("Password changed. Please sign in again with your new password.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.assign("/admin-login");
    } catch (err) { setPasswordError(err instanceof Error ? err.message : "Unable to change password."); }
    finally { setPasswordSaving(false); }
  }

  if (loading) return <p className="text-sm" aria-busy="true">Loading settings…</p>;
  if (saved === null) return (
    <div className="space-y-4">
      <h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Settings</h1>
      <p role="alert" className="text-sm text-red-600">{error || "Unable to load settings."}</p>
      <button type="button" onClick={() => window.location.reload()} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white">
        Retry
      </button>
    </div>
  );

  return (
    <>
      <h1 className="mb-8 text-sm uppercase tracking-[0.18em]">Settings</h1>

      <form onSubmit={onSubmit} className="max-w-xl space-y-6" noValidate>
        <section aria-labelledby="qr-heading" className="space-y-4">
          <h2 id="qr-heading" className="text-[11px] uppercase">Payment QR code</h2>

          <div>
            <label htmlFor="qrUrl" className="text-[13px]">
              Image link <span className="text-black/50">(shown at checkout, Step 1)</span>
            </label>
            <input
              id="qrUrl"
              inputMode="url"
              autoComplete="off"
              placeholder="https://…/my-qr.png"
              value={qrUrl}
              onChange={(e) => {
                setQrUrl(e.target.value);
                setPreviewBroken(false);
                setNotice("");
              }}
              className={input}
            />
            <p className="mt-2 text-[13px] text-black/60">
              Paste a direct link to the image.
            </p>
          </div>

          <div className="grid aspect-square w-full max-w-[240px] place-items-center bg-surface">
            {previewable && !previewBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={trimmed}
                src={trimmed}
                alt="QR code preview"
                onError={() => setPreviewBroken(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="px-4 text-center text-[13px] text-black/50">
                {previewable ? "Couldn't load an image from that link." : "Preview appears here."}
              </p>
            )}
          </div>
        </section>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="text-sm">{notice}</p>}

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={saving || trimmed === saved}
            className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80 disabled:bg-black/30"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <section aria-labelledby="password-heading" className="mt-16 max-w-xl border-t border-black/15 pt-8">
        <h2 id="password-heading" className="mb-5 text-[11px] uppercase">Change admin password</h2>
        <form onSubmit={changePassword} className="space-y-5">
          <label className="block text-[13px]">Old password<input type="password" autoComplete="current-password" required value={oldPassword} onChange={e=>setOldPassword(e.target.value)} className={input} /></label>
          <label className="block text-[13px]">New password<input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={e=>setNewPassword(e.target.value)} className={input} /><span className="mt-1 block text-xs text-black/50">Use at least 12 characters.</span></label>
          <label className="block text-[13px]">Confirm password<input type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={input} /></label>
          {passwordError && <p role="alert" className="text-sm text-red-600">{passwordError}</p>}
          {passwordNotice && <p role="status" className="text-sm">{passwordNotice}</p>}
          <button type="submit" disabled={passwordSaving} className="h-11 bg-black px-8 text-xs uppercase tracking-[0.2em] text-white hover:bg-black/80 disabled:bg-black/30">{passwordSaving ? "Changing…" : "Change password"}</button>
        </form>
      </section>
    </>
  );
}
