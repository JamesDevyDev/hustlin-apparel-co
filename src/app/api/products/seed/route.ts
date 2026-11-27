import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { products } from "@/data/products";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function POST(_r:NextRequest){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();const db=getPool();const count=Number((await db.query("SELECT COUNT(*) FROM products")).rows[0].count);if(count)return Response.json({seeded:false,count});for(const p of products)await db.query(`INSERT INTO products(id,slug,name,price,category,features,images,options,size_chart,stock,stock_by_size,available,featured,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,[p.id||`prd_${randomUUID()}`,p.slug,p.name,p.price,p.category,JSON.stringify(p.features),JSON.stringify(p.images),JSON.stringify(p.options),p.sizeChart?JSON.stringify(p.sizeChart):null,p.stock,JSON.stringify(p.stockBySize ?? { "": p.stock }),p.available,p.featured,p.createdAt]);return Response.json({seeded:true});}catch(e){return Response.json({error:e instanceof Error?e.message:"Seed failed"},{status:500});}}
