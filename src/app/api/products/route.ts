
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  allProducts,
  ensureSchema,
  productFromRow,
} from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { products as seeds } from "@/data/products";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const list = await allProducts(
      request.nextUrl.searchParams.get("category") || undefined
    );

    return Response.json(list);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await ensureSchema();

    const body = await request.json();

    if (!body.name || !Number.isFinite(Number(body.price))) {
      return Response.json(
        { error: "Name and valid price are required." },
        { status: 400 }
      );
    }

    const id = `prd_${randomUUID().replaceAll("-", "").slice(0, 12)}`;

    const slugBase =
      String(body.slug || body.name)
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "product";

    let slug = slugBase;
    let suffix = 2;

    while (
      (
        await getPool().query(
          "SELECT 1 FROM products WHERE slug=$1",
          [slug]
        )
      ).rowCount
    ) {
      slug = `${slugBase}-${suffix++}`;
    }

    const stockBySize = body.stockBySize || {
      "": Number(body.stock ?? 0),
    };

    const totalStock = Object.values(stockBySize).reduce<number>(
      (total, value) => total + Number(value),
      0
    );

    const { rows } = await getPool().query(
      `INSERT INTO products (
        id,
        slug,
        name,
        price,
        category,
        features,
        images,
        options,
        size_chart,
        stock,
        stock_by_size,
        available,
        featured
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        id,
        slug,
        body.name,
        Number(body.price),
        body.category || "tops",
        JSON.stringify(body.features || []),
        JSON.stringify(body.images || []),
        JSON.stringify(body.options || []),
        body.sizeChart ? JSON.stringify(body.sizeChart) : null,
        totalStock,
        JSON.stringify(stockBySize),
        body.available !== false,
        body.featured === true,
      ]
    );

    return Response.json(productFromRow(rows[0]), {
      status: 201,
    });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Could not create product",
      },
      { status: 400 }
    );
  }
}

export async function PUT() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await ensureSchema();

    const count = Number(
      (
        await getPool().query(
          "SELECT COUNT(*) FROM products"
        )
      ).rows[0].count
    );

    if (count) {
      return Response.json({
        seeded: false,
        count,
      });
    }

    for (const p of seeds) {
      await getPool().query(
        `INSERT INTO products (
          id,
          slug,
          name,
          price,
          category,
          features,
          images,
          options,
          size_chart,
          stock,
          stock_by_size,
          available,
          featured,
          created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.slug,
          p.name,
          p.price,
          p.category,
          JSON.stringify(p.features),
          JSON.stringify(p.images),
          JSON.stringify(p.options),
          p.sizeChart
            ? JSON.stringify(p.sizeChart)
            : null,
          p.stock,
          JSON.stringify(p.stockBySize ?? { "": p.stock }),
          p.available,
          p.featured,
          p.createdAt,
        ]
      );
    }

    return Response.json({
      seeded: true,
      count: seeds.length,
    });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Seed failed",
      },
      { status: 500 }
    );
  }
}
