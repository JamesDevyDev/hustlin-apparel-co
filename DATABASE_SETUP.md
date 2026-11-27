# Neon PostgreSQL setup

1. Create a PostgreSQL project in Neon.
2. Copy the **pooled** connection string from Neon (Connect button) into `.env.local` as `DATABASE_URL`.
3. Install dependencies with `npm install` and start the app with `npm run dev`.
4. The API creates the required tables automatically on first database access. You can also run `database/schema.sql` in the Neon SQL Editor.
5. Seed the initial sample products once by sending `POST http://localhost:3000/api/products/seed` (or use an API client). The endpoint only seeds when the products table is empty.

## API

- `GET /api/categories` and `GET /api/categories/:slug` — categories
- `GET /api/products?category=tops` — list products
- `POST /api/products` — create product
- `GET /api/products/:id` — get product
- `PATCH /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product
- `GET /api/products/slug/:slug` — storefront product lookup
- `GET /api/orders` — list orders
- `POST /api/orders` — place order; server checks current prices and stock and deducts stock in a transaction
- `GET /api/orders/:id` — order details
- `PATCH /api/orders/:id/review` — `{ "decision": "verified" | "rejected" }`; rejection restores stock
- `GET /api/settings`, `PATCH /api/settings`, `DELETE /api/settings`
- `GET /api/featured`, `POST /api/featured`, `PATCH /api/featured/:id`, `DELETE /api/featured/:id`

## Important before production

The starter project does not include admin authentication. These API routes currently allow unauthenticated product, order-review, settings, and featured-content mutations. Add authentication and authorization (for example, a server-validated admin session) before deploying publicly. Never expose `DATABASE_URL` in a `NEXT_PUBLIC_` variable. Existing browser localStorage data is not automatically migrated; seed the initial catalog and manually import any existing local data you need to keep.
