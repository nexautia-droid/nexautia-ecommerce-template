"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

export default function CartIndicator({ lang }: { lang: "es" | "ca" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    update(); window.addEventListener("cart-updated", update); window.addEventListener("storage", update);
    return () => { window.removeEventListener("cart-updated", update); window.removeEventListener("storage", update); };
  }, []);
  return <Link href={`/${lang}/cesta`}>{lang === "es" ? "Cesta" : "Cistella"} ({count})</Link>;
}
