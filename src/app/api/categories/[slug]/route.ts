import { NextRequest } from "next/server";
import { categoryBySlug } from "@/lib/db/queries";
export const runtime="nodejs";
export async function GET(_r:NextRequest,c:{params:Promise<{slug:string}>}){try{const{slug}=await c.params;const category=await categoryBySlug(slug);return category?Response.json(category):Response.json({error:"Category not found."},{status:404});}catch{return Response.json({error:"Database error"},{status:500});}}
