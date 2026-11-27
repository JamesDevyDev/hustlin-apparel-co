import { isValidImageLink } from "@/lib/services/settings-service";
export const FEATURED_CHANGED_EVENT="fibonacci:featured-changed";
export interface Wallpaper {id:string;url:string;title?:string;href?:string}
export interface WallpaperInput {url:string;title?:string;href?:string}
async function request<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed");return d as T;}
function changed(){window.dispatchEvent(new Event(FEATURED_CHANGED_EVENT));}
export async function listWallpapers():Promise<Wallpaper[]>{return request("/api/featured");}
export async function addWallpaper(input:WallpaperInput):Promise<Wallpaper>{if(!isValidImageLink(input.url.trim()))throw new Error("Image link must start with https:// (or / for a file in /public).");const w=await request<Wallpaper>("/api/featured",{method:"POST",body:JSON.stringify(input)});changed();return w;}
export async function removeWallpaper(id:string):Promise<void>{await request(`/api/featured/${encodeURIComponent(id)}`,{method:"DELETE"});changed();}
export async function moveWallpaper(id:string,delta:-1|1):Promise<void>{await request(`/api/featured/${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify({delta})});changed();}
