import { PAYMENT_QR_SRC } from "@/lib/config";
export const SETTINGS_CHANGED_EVENT="fibonacci:settings-changed";
export interface Settings {qrUrl:string}
export const DEFAULT_SETTINGS:Settings={qrUrl:PAYMENT_QR_SRC};
export function isValidImageLink(url:string){return /^https?:\/\/\S+$/i.test(url)||/^\/\S+$/.test(url);}
async function request<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed");return d as T;}
export async function getSettings():Promise<Settings>{return request("/api/settings");}
export async function updateSettings(patch:Partial<Settings>):Promise<Settings>{const s=await request<Settings>("/api/settings",{method:"PATCH",body:JSON.stringify(patch)});window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));return s;}
export async function resetSettings():Promise<Settings>{const s=await request<Settings>("/api/settings",{method:"DELETE"});window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));return s;}
