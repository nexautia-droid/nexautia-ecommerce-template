"use client";

import { useState } from "react";
import { readCart, writeCart } from "@/lib/cart";

export default function AddToCart({ slug, name, price, lang }: { slug: string; name: string; price: number; lang: "es" | "ca" }) {
  const [added, setAdded] = useState(false);
  function add() {
    const items = readCart();
    const current = items.find((item) => item.slug === slug);
    if (current) current.quantity += 1;
    else items.push({ slug, name, price, quantity: 1, lang });
    writeCart(items);
    setAdded(true);
  }
  return <button className="button primary" onClick={add}>{added ? (lang === "es" ? "A\u00f1adido a la cesta" : "Afegit a la cistella") : (lang === "es" ? "A\u00f1adir a la cesta" : "Afegir a la cistella")}</button>;
}
