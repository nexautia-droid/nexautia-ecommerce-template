"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { readCart, writeCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang === "ca" ? "ca" : "es";
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setItems(readCart()));
    return () => cancelAnimationFrame(frame);
  }, []);
  function change(slug: string, quantity: number) {
    const next = items.map((item) => item.slug === slug ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    setItems(next); writeCart(next);
  }
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <main className="cart-page">
    <header className="detail-header"><Link href={`/${lang}`}><Image src="/brand/logo.svg" width={204} height={60} alt="Nexautia"/></Link><Link href={`/${lang}`}>{lang === "es" ? "Seguir comprando" : "Continuar comprant"} &larr;</Link></header>
    <section className="cart-content"><p className="eyebrow">Nexautia / E-commerce</p><h1>{lang === "es" ? "Tu cesta" : "La teva cistella"}</h1>
      {items.length === 0 ? <div className="empty-cart"><p>{lang === "es" ? "Todav\u00eda no has a\u00f1adido ning\u00fan producto." : "Encara no has afegit cap producte."}</p><Link className="button primary" href={`/${lang}#productos`}>{lang === "es" ? "Ver productos" : "Veure productes"}</Link></div> : <>
        <div className="cart-list">{items.map((item) => <article className="cart-row" key={item.slug}><div><h2>{item.name}</h2><p>{item.price} EUR</p></div><div className="quantity"><button onClick={() => change(item.slug, item.quantity - 1)} aria-label="Restar">-</button><span>{item.quantity}</span><button onClick={() => change(item.slug, item.quantity + 1)} aria-label="Sumar">+</button></div><strong>{item.price * item.quantity} EUR</strong><button className="remove" onClick={() => change(item.slug, 0)}>{lang === "es" ? "Eliminar" : "Eliminar"}</button></article>)}</div>
        <div className="cart-total"><span>Total</span><strong>{total} EUR</strong></div><button className="button primary checkout" disabled>{lang === "es" ? "Pago disponible al conectar la pasarela" : "Pagament disponible en connectar la passarel\u00b7la"}</button>
      </>}
    </section>
  </main>;
}
