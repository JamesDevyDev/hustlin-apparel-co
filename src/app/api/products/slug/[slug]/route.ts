import { NextRequest } from "next/server";
import { productBySlug } from "@/lib/db/queries";
export const runtime="nodejs";
export async function GET(_r:NextRequest,c:{params:Promise<{slug:string}>}){try{const{slug}=await c.params;const p=await productBySlug(slug);return p?Response.json(p):Response.json({error:"Product not found."},{status:404});}catch{return Response.json({error:"Database error"},{status:500});}}
