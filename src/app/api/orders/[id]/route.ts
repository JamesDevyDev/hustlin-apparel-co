import { NextRequest } from "next/server";
import { ensureSchema, orderFromRow } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
export const runtime="nodejs";
export async function GET(_r:NextRequest,c:{params:Promise<{id:string}>}){try{await ensureSchema();const{id}=await c.params;const{rows}=await getPool().query("SELECT * FROM orders WHERE id=$1",[id]);return rows[0]?Response.json(orderFromRow(rows[0])):Response.json({error:"Order not found."},{status:404});}catch{return Response.json({error:"Database error"},{status:500});}}
