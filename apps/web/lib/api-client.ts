import type { Order, OfferCandidate, Product } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

export interface SearchProductsParams {
  query?: string;
  country?: string;
  category?: string;
}

export function searchProducts(params: SearchProductsParams = {}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.query) qs.set("query", params.query);
  if (params.country) qs.set("country", params.country);
  if (params.category) qs.set("category", params.category);
  const suffix = qs.toString();
  return request<Product[]>(`/products${suffix ? `?${suffix}` : ""}`);
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export function getProductOffers(id: string): Promise<OfferCandidate[]> {
  return request<OfferCandidate[]>(`/products/${id}/offers`);
}

export interface CreateOrderBody {
  userId: string;
  productId: string;
  sellingPrice: number;
}

export function createOrder(body: CreateOrderBody): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export function listOrders(userId: string): Promise<Order[]> {
  return request<Order[]>(`/orders?userId=${encodeURIComponent(userId)}`);
}
