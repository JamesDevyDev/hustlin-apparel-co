import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import type { Wallpaper } from "@/lib/services/featured-service";
import { categories as seedCategories } from "@/data/categories";
import { getPool } from "@/lib/db";
import { initializeAdminPassword } from "@/lib/admin-auth";

export async function ensureSchema() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0), category TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]', images JSONB NOT NULL DEFAULT '[]',
      options JSONB NOT NULL DEFAULT '[]', size_chart JSONB,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      available BOOLEAN NOT NULL DEFAULT TRUE, featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      customer JSONB NOT NULL, items JSONB NOT NULL, subtotal INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL, total INTEGER NOT NULL, receipt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
      reviewed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS store_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      body TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS featured_wallpapers (
      id TEXT PRIMARY KEY, url TEXT NOT NULL, title TEXT, href TEXT,
      display_type TEXT NOT NULL DEFAULT 'desktop',
      position INTEGER NOT NULL DEFAULT 0
    );
    ALTER TABLE featured_wallpapers
      ADD COLUMN IF NOT EXISTS display_type TEXT NOT NULL DEFAULT 'desktop';
    CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
  `);
  await initializeAdminPassword();
  for (const category of seedCategories) await db.query("INSERT INTO categories(id,slug,name) VALUES($1,$2,$3) ON CONFLICT (id) DO NOTHING", [category.id, category.slug, category.name]);
}

export function productFromRow(row: any): Product {
  return { id: row.id, slug: row.slug, name: row.name, price: row.price, category: row.category,
    features: row.features ?? [], images: row.images ?? [], options: row.options ?? [],
    ...(row.size_chart ? { sizeChart: row.size_chart } : {}), stock: row.stock,
    available: row.available, featured: row.featured,
    createdAt: new Date(row.created_at).toISOString().slice(0, 10) };
}

export async function allProducts(category?: string) {
  await ensureSchema();
  const { rows } = await getPool().query(`SELECT * FROM products ${category ? 'WHERE category = $1' : ''} ORDER BY created_at DESC`, category ? [category] : []);
  return rows.map(productFromRow);
}

export async function productById(id: string) {
  await ensureSchema(); const { rows } = await getPool().query("SELECT * FROM products WHERE id=$1", [id]);
  return rows[0] ? productFromRow(rows[0]) : null;
}
export async function productBySlug(slug: string) {
  await ensureSchema(); const { rows } = await getPool().query("SELECT * FROM products WHERE slug=$1", [slug]);
  return rows[0] ? productFromRow(rows[0]) : null;
}

export function orderFromRow(row: any): Order {
  return { id: row.id, createdAt: new Date(row.created_at).toISOString(), customer: row.customer,
    items: row.items, subtotal: row.subtotal, shippingFee: row.shipping_fee, total: row.total,
    receipt: row.receipt, status: row.status, ...(row.reviewed_at ? { reviewedAt: new Date(row.reviewed_at).toISOString() } : {}) };
}
export async function orderById(id: string) {
  await ensureSchema(); const { rows } = await getPool().query("SELECT * FROM orders WHERE id=$1", [id]);
  return rows[0] ? orderFromRow(rows[0]) : null;
}
export async function allOrders() {
  await ensureSchema(); const { rows } = await getPool().query("SELECT * FROM orders ORDER BY created_at DESC");
  return rows.map(orderFromRow);
}
export async function allWallpapers(): Promise<Wallpaper[]> {
  await ensureSchema(); const { rows } = await getPool().query(`SELECT id, url, title, href, display_type AS "displayType" FROM featured_wallpapers ORDER BY position ASC`);
  return rows;
}

export async function allCategories() { await ensureSchema(); const { rows } = await getPool().query("SELECT id,slug,name FROM categories ORDER BY name"); return rows; }
export async function categoryBySlug(slug: string) { await ensureSchema(); const { rows } = await getPool().query("SELECT id,slug,name FROM categories WHERE slug=$1", [slug]); return rows[0] ?? null; }


export type AboutContent = { header: string; body: string };

export async function getAboutContent(): Promise<AboutContent | null> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT value FROM store_settings WHERE key='about'");
  const value = rows[0]?.value as AboutContent | undefined;
  if (!value || typeof value.header !== "string" || typeof value.body !== "string") return null;
  const header = value.header.trim();
  const body = value.body.trim();
  return header && body ? { header, body } : null;
}
