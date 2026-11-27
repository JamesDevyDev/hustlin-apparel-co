import { NextRequest } from "next/server";
import { products } from "@/data/products";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function DELETE(_r:NextRequest){
  const authError = await requireAdmin();
  if (authError) return authError;const client=await getPool().connect();try{await ensureSchema();await client.query("BEGIN");await client.query("DELETE FROM products");for(const p of products)await client.query(`INSERT INTO products(id,slug,name,price,category,features,images,options,size_chart,stock,stock_by_size,available,featured,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,[p.id,p.slug,p.name,p.price,p.category,JSON.stringify(p.features),JSON.stringify(p.images),JSON.stringify(p.options),p.sizeChart?JSON.stringify(p.sizeChart):null,p.stock,JSON.stringify(p.stockBySize ?? { "": p.stock }),p.available,p.featured,p.createdAt]);await client.query("COMMIT");return Response.json({reset:true});}catch(e){await client.query("ROLLBACK");return Response.json({error:e instanceof Error?e.message:"Reset failed"},{status:500});}finally{client.release();}}
