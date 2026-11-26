-- Hustlin database schema (PostgreSQL / Neon)
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
CREATE TABLE IF NOT EXISTS featured_wallpapers (
  id TEXT PRIMARY KEY, url TEXT NOT NULL, title TEXT, href TEXT, position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
