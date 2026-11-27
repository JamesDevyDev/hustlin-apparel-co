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
      const quantities = new Map<string, number>();

      for (const line of order.items as { productId: string; quantity: number }[]) {
        quantities.set(
          line.productId,
          (quantities.get(line.productId) ?? 0) + Number(line.quantity),
        );
      }

      for (const [productId, quantity] of quantities) {
        const result = await client.query(
          `UPDATE products
           SET stock = stock - $2
           WHERE id = $1 AND stock >= $2
           RETURNING id`,
          [productId, quantity],
        );

        if (result.rowCount === 0) {
          const product = await client.query(
            "SELECT name, stock FROM products WHERE id = $1",
            [productId],
          );
          if (!product.rows[0]) {
            throw new Error("A product in this order no longer exists.");
          }
          throw new Error(
            `Not enough stock for ${product.rows[0].name}. Only ${product.rows[0].stock} left.`,
          );
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
