import type { CartLine } from "@/types/cart";
import type { Order, OrderCustomer } from "@/types/order";
export const ORDERS_CHANGED_EVENT="fibonacci:orders-changed";
export interface OrderInput {customer:OrderCustomer;items:CartLine[];receipt:string;captchaToken:string}
async function request<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed");return d as T;}
export async function placeOrder(input:OrderInput):Promise<Order>{const order=await request<Order>("/api/orders",{method:"POST",body:JSON.stringify(input)});window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));return order;}
export async function getOrderById(id:string):Promise<Order|null>{const r=await fetch(`/api/orders/${encodeURIComponent(id)}`,{cache:"no-store"});if(r.status===404)return null;const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");return d;}
export async function listOrders():Promise<Order[]>{return request("/api/orders");}
export async function reviewOrder(id:string,decision:"verified"|"rejected"):Promise<Order>{const o=await request<Order>(`/api/orders/${encodeURIComponent(id)}/review`,{method:"PATCH",body:JSON.stringify({decision})});window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));return o;}
