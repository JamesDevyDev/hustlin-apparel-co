/** Verify a Cloudflare Turnstile token on the server. Fail closed when misconfigured. */
export async function verifyTurnstileToken(token: unknown, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (typeof token !== "string" || !token.trim() || !secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result: { success?: boolean } = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}
