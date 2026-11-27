import { NextRequest } from "next/server";
import { randomInt } from "crypto";
import { SHIPPING_FEE } from "@/lib/config";
import { allOrders, ensureSchema, orderFromRow } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function orderCode(){let s="HAC-";for(let i=0;i<6;i++)s+=chars[randomInt(chars.length)];return s;}
export async function GET(){
  const authError = await requireAdmin();
  if (authError) return authError;try{return Response.json(await allOrders());}catch(e){return Response.json({error:e instanceof Error?e.message:"Database error"},{status:500});}}
export async function POST(r:NextRequest){let client: import("pg").PoolClient | undefined;try{const db=getPool();client=await db.connect();await ensureSchema();const b=await r.json();if(!b.customer||!Array.isArray(b.items)||!b.items.length)return Response.json({error:"Customer details and at least one item are required."},{status:400});await client.query("BEGIN");let subtotal=0;const verifiedItems=[];for(const line of b.items){const qty=Math.floor(Number(line.quantity));if(!line.productId||!Number.isInteger(qty)||qty<1)throw new Error("Invalid cart quantity.");const {rows}=await client.query("SELECT * FROM products WHERE id=$1 FOR UPDATE",[line.productId]);const p=rows[0];if(!p||!p.available)throw new Error(`${p?.name??"An item"} is no longer available.`);if(p.stock<qty)throw new Error(`Only ${p.stock} left of ${p.name}.`);const price=Number(p.price);subtotal+=price*qty;verifiedItems.push({...line,productId:p.id,slug:p.slug,name:p.name,price,quantity:qty});}
let id=orderCode();for(let i=0;i<4&&(await client.query("SELECT 1 FROM orders WHERE id=$1",[id])).rowCount;i++)id=orderCode();const {rows}=await client.query(`INSERT INTO orders(id,customer,items,subtotal,shipping_fee,total,receipt,status) VALUES($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,[id,JSON.stringify(b.customer),JSON.stringify(verifiedItems),subtotal,SHIPPING_FEE,subtotal+SHIPPING_FEE,String(b.receipt||"")]);await client.query("COMMIT");return Response.json(orderFromRow(rows[0]),{status:201});}catch(e){if(client) await client.query("ROLLBACK");return Response.json({error:e instanceof Error?e.message:"Could not place order"},{status:400});}finally{client?.release();}}
