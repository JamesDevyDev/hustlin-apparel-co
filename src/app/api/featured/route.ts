import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { allWallpapers, ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function GET(){try{return Response.json(await allWallpapers());}catch{return Response.json({error:"Database error"},{status:500});}}
export async function POST(r:NextRequest){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();const b=await r.json();const url=String(b.url||"").trim();if(!(/^https?:\/\/\S+$/i.test(url)||/^\/\S+$/.test(url)))return Response.json({error:"Invalid image link."},{status:400});const href=String(b.href||"").trim();if(href&&!/^(https?:\/\/|\/)\S*$/i.test(href))return Response.json({error:"Invalid button link."},{status:400});const id=`wp_${randomUUID().slice(0,12)}`;const pos=Number((await getPool().query("SELECT COALESCE(MAX(position),-1)+1 AS n FROM featured_wallpapers")).rows[0].n);const{rows}=await getPool().query("INSERT INTO featured_wallpapers(id,url,title,href,position) VALUES($1,$2,$3,$4,$5) RETURNING id,url,title,href",[id,url,b.title||null,href||null,pos]);return Response.json(rows[0],{status:201});}catch(e){return Response.json({error:e instanceof Error?e.message:"Create failed"},{status:400});}}
