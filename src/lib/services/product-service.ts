import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export type ProductInput = Omit<Product, "id" | "createdAt" | "slug"> & { slug?: string };
export function slugify(text: string) { return text.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
async function request<T>(url:string, init?:RequestInit):Promise<T>{const r=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store"});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"Request failed.");return data as T;}
export async function listProducts(opts:{category?:string}={}):Promise<Product[]>{return request(`/api/products${opts.category?`?category=${encodeURIComponent(opts.category)}`:""}`);}
export async function getProductBySlug(slug:string):Promise<Product|null>{const r=await fetch(`/api/products/slug/${encodeURIComponent(slug)}`,{cache:"no-store"});if(r.status===404)return null;const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");return d;}
export async function listRelatedProducts(product:Product,limit=3):Promise<Product[]>{const all=await listProducts();const same=all.filter(p=>p.id!==product.id&&p.category===product.category),other=all.filter(p=>p.id!==product.id&&p.category!==product.category);return [...same,...other].slice(0,limit);}
export async function getCategoryBySlug(slug:string):Promise<Category|null>{const r=await fetch(`/api/categories/${encodeURIComponent(slug)}`,{cache:"no-store"});if(r.status===404)return null;const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");return d;}
export async function getProductById(id:string):Promise<Product|null>{const r=await fetch(`/api/products/${encodeURIComponent(id)}`,{cache:"no-store"});if(r.status===404)return null;const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");return d;}
export async function createProduct(input:ProductInput):Promise<Product>{return request("/api/products",{method:"POST",body:JSON.stringify(input)});}
export async function updateProduct(id:string,input:ProductInput):Promise<Product>{return request(`/api/products/${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify(input)});}
export async function deleteProduct(id:string):Promise<void>{await request(`/api/products/${encodeURIComponent(id)}`,{method:"DELETE"});}
export async function resetProducts():Promise<void>{await request("/api/products/reset",{method:"DELETE"});}
export class StockError extends Error {}
export interface StockLine {productId:string;quantity:number}
export async function deductStock(_lines:StockLine[]):Promise<void>{throw new Error("Stock is deducted atomically when an order is placed.");}
export async function restoreStock(_lines:StockLine[]):Promise<void>{throw new Error("Stock restoration is handled by the order review API.");}
