import { NextRequest } from "next/server";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function DELETE(_r:NextRequest,c:{params:Promise<{id:string}>}){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();const{id}=await c.params;await getPool().query("DELETE FROM featured_wallpapers WHERE id=$1",[id]);return new Response(null,{status:204});}catch{return Response.json({error:"Delete failed"},{status:500});}}
export async function PATCH(r:NextRequest,c:{params:Promise<{id:string}>}){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();const{id}=await c.params;const{delta}=await r.json();if(delta!==1&&delta!==-1)return Response.json({error:"Invalid move."},{status:400});const db=getPool();const{rows}=await db.query("SELECT id,position FROM featured_wallpapers ORDER BY position");const i=rows.findIndex((x:any)=>x.id===id),j=i+delta;if(i<0||j<0||j>=rows.length)return Response.json({ok:true});const client=await db.connect();try{await client.query("BEGIN");await client.query("UPDATE featured_wallpapers SET position=$2 WHERE id=$1",[rows[i].id,-1]);await client.query("UPDATE featured_wallpapers SET position=$2 WHERE id=$1",[rows[j].id,rows[i].position]);await client.query("UPDATE featured_wallpapers SET position=$2 WHERE id=$1",[rows[i].id,rows[j].position]);await client.query("COMMIT");}catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}return Response.json({ok:true});}catch{return Response.json({error:"Move failed"},{status:500});}}
