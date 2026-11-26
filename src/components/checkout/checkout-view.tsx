"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCart } from "@/contexts/cart-context";
import { PAYMENT_QR_SRC, SHIPPING_FEE } from "@/lib/config";
import { useSettings } from "@/hooks/use-settings";
import { fileToReceiptDataUrl } from "@/lib/image";
import { placeOrder } from "@/lib/services/order-service";
import { StockError } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/utils";
import type { OrderCustomer } from "@/types/order";

const inputClass =
  "mt-2 h-[46px] w-full rounded-[3px] border-2 border-black bg-surface px-3 text-base font-light";

const EMPTY: OrderCustomer = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
};

const REQUIRED: [keyof OrderCustomer, string][] = [
  ["fullName", "full name"],
  ["email", "email"],
  ["phone", "mobile number"],
  ["address", "street address"],
  ["city", "city or municipality"],
  ["province", "province"],
  ["postalCode", "postal code"],
];

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px]">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={inputClass}
      />
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();

  const [values, setValues] = useState<OrderCustomer>(EMPTY);
  const [receipt, setReceipt] = useState<{ name: string; dataUrl: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [qrFailed, setQrFailed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stockProblem, setStockProblem] = useState(false);

  const settings = useSettings();
  const qrSrc = settings?.qrUrl ?? PAYMENT_QR_SRC;
  const qrMissing = qrFailed === qrSrc; // a new link gets a fresh try

  const total = subtotal + SHIPPING_FEE;

  const bind = (key: keyof OrderCustomer) => ({
    value: values[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  async function onReceipt(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      setReceipt({ name: file.name, dataUrl: await fileToReceiptDataUrl(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image.");
    } finally {
      setProcessing(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStockProblem(false);

    const customer: OrderCustomer = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v.trim()]),
    ) as unknown as OrderCustomer;

    for (const [key, label] of REQUIRED) {
      if (!customer[key]) return setError(`Please enter your ${label}.`);
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      return setError("Please enter a valid email address.");
    }
    if (customer.phone.replace(/\D/g, "").length < 7) {
      return setError("Please enter a valid mobile number.");
    }
    if (!receipt) return setError("Please upload your payment receipt (Step 3).");

    setSubmitting(true);
    try {
      const order = await placeOrder({ customer, items, receipt: receipt.dataUrl });
      setDone(true);
      clear();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setStockProblem(err instanceof StockError);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="h-40" aria-busy="true" />;

  if (done) return <p className="py-16 text-center text-sm">Order placed. Redirecting…</p>;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block h-11 bg-black px-8 text-xs uppercase leading-[44px] tracking-[0.2em] text-white hover:bg-black/80"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-12 md:grid-cols-[minmax(0,1fr)_380px] md:gap-[60px]">
      {/* Delivery details */}
      <div className="space-y-6">
        <h2 className="text-sm uppercase tracking-[0.18em]">Delivery details</h2>
        <Field id="fullName" label="Full name" autoComplete="name" {...bind("fullName")} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="email" label="Email" type="email" autoComplete="email" inputMode="email" {...bind("email")} />
          <Field id="phone" label="Mobile number" type="tel" autoComplete="tel" inputMode="tel" {...bind("phone")} />
        </div>
        <Field id="address" label="Street address" autoComplete="street-address" {...bind("address")} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="city" label="City / Municipality" autoComplete="address-level2" {...bind("city")} />
          <Field id="province" label="Province" autoComplete="address-level1" {...bind("province")} />
        </div>
        <div className="sm:max-w-[50%]">
          <Field id="postalCode" label="Postal code" autoComplete="postal-code" inputMode="numeric" {...bind("postalCode")} />
        </div>
        <div>
          <label htmlFor="notes" className="text-[13px]">
            Notes <span className="text-black/50">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            {...bind("notes")}
            className="mt-2 w-full rounded-[3px] border-2 border-black bg-surface px-3 py-2 text-base font-light"
          />
        </div>
      </div>

      {/* Summary + payment */}
      <div className="space-y-10">
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-sm uppercase tracking-[0.18em]">Order summary</h2>
          <ul className="mt-4 border-t border-black/15">
            {items.map((line) => {
              const optionText = Object.entries(line.options)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
              return (
                <li key={line.id} className="flex justify-between gap-4 border-b border-black/15 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="uppercase">{line.name}</p>
                    {optionText && <p className="text-[13px] text-black/60">{optionText}</p>}
                    <p className="text-[13px] text-black/60">Qty {line.quantity}</p>
                  </div>
                  <p className="shrink-0 tracking-wider">{formatPrice(line.price * line.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tracking-wider">{formatPrice(subtotal)}</dd>
            </div>
            {SHIPPING_FEE > 0 && (
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="tracking-wider">{formatPrice(SHIPPING_FEE)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <dt>Total</dt>
              <dd className="text-lg tracking-wider">{formatPrice(total)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="pay-heading" className="border-2 border-black p-5">
          <p className="text-sm">Thanks for checking out our product.</p>
          <h2 id="pay-heading" className="mt-4 text-sm uppercase tracking-[0.18em]">How to pay?</h2>

          <ol className="mt-4 space-y-4 text-sm">
            <li>
              <p><span className="font-normal">Step 1 :</span> Scan the QR code</p>
              <div className="mt-3 grid aspect-square w-full max-w-[240px] place-items-center bg-surface">
                {qrMissing ? (
                  <p className="px-4 text-center text-[13px] text-black/50">
                    QR code not set up yet. Add a link in Admin → Settings.
                  </p>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={qrSrc}
                    src={qrSrc}
                    alt="Payment QR code"
                    onError={() => setQrFailed(qrSrc)}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </li>
            <li>
              <p><span className="font-normal">Step 2 :</span> Pay the amount shown on the screen <span className="text-black/60">(must be the exact total amount)</span></p>
              <p className="mt-2 text-2xl tracking-wider">{formatPrice(total)}</p>
            </li>
            <li>
              <p><span className="font-normal">Step 3 :</span> Upload the receipt</p>
              <label
                htmlFor="receipt"
                className="mt-3 inline-block cursor-pointer border border-black px-4 py-2 text-[13px] hover:bg-surface"
              >
                {processing ? "Processing…" : receipt ? "Change receipt" : "Choose image"}
              </label>
              <input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={onReceipt}
                disabled={processing}
                className="sr-only"
              />
              {receipt && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receipt.dataUrl} alt="Your receipt" className="max-h-56 border border-black/15" />
                  <p className="mt-1 break-all text-[13px] text-black/60">{receipt.name}</p>
                </div>
              )}
            </li>
          </ol>
        </section>

        {error && (
          <div role="alert" className="text-sm text-red-600">
            <p>{error}</p>
            {stockProblem && (
              <Link href="/cart" className="mt-1 inline-block underline underline-offset-4">
                Update your cart
              </Link>
            )}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting || processing}
            className="h-11 w-full bg-black text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/80 disabled:bg-black/30"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <Link href="/cart" className="mt-4 block text-center text-[13px] underline underline-offset-4">
            Back to cart
          </Link>
        </div>
      </div>
    </form>
  );
}
