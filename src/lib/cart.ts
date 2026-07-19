export type CartItem = { slug: string; name: string; price: number; quantity: number; lang: "es" | "ca" };
export const CART_KEY = "nexautia-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}
