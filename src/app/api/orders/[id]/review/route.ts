import { NextRequest } from "next/server";
import { ensureSchema, orderFromRow } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let client: import("pg").PoolClient | undefined;

  try {
    client = await getPool().connect();
    await ensureSchema();

    const { id } = await context.params;
    const { decision } = await request.json();

    if (decision !== "verified" && decision !== "rejected") {
      return Response.json({ error: "Invalid decision." }, { status: 400 });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
      [id],
    );
    const order = rows[0];

    if (!order) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "pending") {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "This order was already reviewed." },
        { status: 409 },
      );
    }

    // Stock is only deducted after the admin verifies the payment/order.
    // Pending and rejected orders do not change product inventory.
    if (decision === "verified") {
      const quantities = new Map<string, { productId: string; size: string; quantity: number }>();

      for (const line of order.items as { productId: string; quantity: number; options?: Record<string, string> }[]) {
        const size = line.options?.Size ?? line.options?.size ?? "";
        const key = `${line.productId}::${size}`;
        const current = quantities.get(key);
        quantities.set(key, { productId: line.productId, size, quantity: (current?.quantity ?? 0) + Number(line.quantity) });
      }

      for (const { productId, size, quantity } of quantities.values()) {
        const result = await client.query(
          `UPDATE products
           SET stock_by_size = jsonb_set(stock_by_size, ARRAY[$2]::text[], to_jsonb(COALESCE((stock_by_size ->> $2)::integer, 0) - $3), false),
               stock = stock - $3
           WHERE id = $1 AND COALESCE((stock_by_size ->> $2)::integer, 0) >= $3
           RETURNING id`,
          [productId, size, quantity],
        );

        if (result.rowCount === 0) {
          const product = await client.query(
            "SELECT name, COALESCE((stock_by_size ->> $2)::integer, 0) AS size_stock FROM products WHERE id = $1",
            [productId, size],
          );
          if (!product.rows[0]) throw new Error("A product in this order no longer exists.");
          throw new Error(`Not enough stock for ${product.rows[0].name} (${size || "default"}). Only ${product.rows[0].size_stock} left.`);
        }
      }
    }

    const updated = await client.query(
      "UPDATE orders SET status = $2, reviewed_at = NOW() WHERE id = $1 RETURNING *",
      [id, decision],
    );

    await client.query("COMMIT");
    return Response.json(orderFromRow(updated.rows[0]));
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    return Response.json(
      { error: error instanceof Error ? error.message : "Review failed" },
      { status: 400 },
    );
  } finally {
    client?.release();
  }
}
