import { NextRequest } from "next/server";
import { PAYMENT_QR_SRC } from "@/lib/config";
import { ensureSchema } from "@/lib/db/queries";
import { getPool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function GET(){try{await ensureSchema();const{rows}=await getPool().query("SELECT value FROM store_settings WHERE key='settings'");return Response.json(rows[0]?.value??{qrUrl:PAYMENT_QR_SRC});}catch{return Response.json({error:"Database error"},{status:500});}}
export async function PATCH(r:NextRequest){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();const b=await r.json();const current=(await getPool().query("SELECT value FROM store_settings WHERE key='settings'")).rows[0]?.value??{qrUrl:PAYMENT_QR_SRC};const next={...current,...b};if(typeof next.qrUrl!=="string"||!(/^https?:\/\/\S+$/i.test(next.qrUrl)||/^\/\S+$/.test(next.qrUrl)))return Response.json({error:"Invalid QR image link."},{status:400});await getPool().query("INSERT INTO store_settings(key,value) VALUES('settings',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value",[JSON.stringify(next)]);return Response.json(next);}catch(e){return Response.json({error:e instanceof Error?e.message:"Save failed"},{status:400});}}
export async function DELETE(){
  const authError = await requireAdmin();
  if (authError) return authError;try{await ensureSchema();await getPool().query("DELETE FROM store_settings WHERE key='settings'");return Response.json({qrUrl:PAYMENT_QR_SRC});}catch{return Response.json({error:"Reset failed"},{status:500});}}
