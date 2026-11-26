# Cloudflare Turnstile setup

Checkout now uses Cloudflare Turnstile and the order API verifies each token server-side before it reserves stock or creates an order.

## 1. Create Turnstile keys

In the Cloudflare dashboard, open **Turnstile**, add your site, and allow the hostnames you use (for local development, include `localhost`). Copy the site key and secret key.

For local testing, Cloudflare provides test keys in its Turnstile documentation. Use the matching test site/secret key pair only for development; replace them with your own production keys before deployment.

## 2. Configure environment variables

Add these to the project's server environment / `.env.local`:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is intentionally public and used by the browser widget. `TURNSTILE_SECRET_KEY` must remain server-only: do not prefix it with `NEXT_PUBLIC_`, do not expose it in client code, and do not commit it.

Restart the Next.js development server after changing environment variables.

## 3. Behavior

- The Place Order button remains disabled until Turnstile returns a token.
- The checkout sends the token to `POST /api/orders`.
- The server calls Cloudflare Siteverify and rejects missing, invalid, expired, or reused tokens.
- If server verification is unavailable or the secret key is missing, order creation fails closed.
- A fresh challenge is required after an unsuccessful order attempt because Turnstile tokens are single-use.

## Files changed

- `src/components/checkout/checkout-view.tsx`
- `src/lib/services/order-service.ts`
- `src/app/api/orders/route.ts`
- `src/lib/turnstile.ts` (new)
- `src/lib/config.ts` (restored the optional QR URL constant referenced elsewhere in this source archive)
