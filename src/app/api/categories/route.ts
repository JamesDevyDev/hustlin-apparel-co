import { allCategories } from "@/lib/db/queries";
export const runtime="nodejs";
export async function GET(){try{return Response.json(await allCategories());}catch{return Response.json({error:"Database error"},{status:500});}}
