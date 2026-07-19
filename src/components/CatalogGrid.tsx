"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCatalog, type CatalogProduct } from "@/lib/catalog";
import type { Locale } from "@/lib/dictionaries";

export default function CatalogGrid({ locale }: { locale: Locale }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCatalog(locale)
      .then((data) => { if (active) setProducts(data); })
      .catch(() => { if (active) setError(locale === "es" ? "No se ha podido actualizar el catálogo." : "No s'ha pogut actualitzar el catàleg."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [locale]);

  if (loading) return <p className="catalog-state">{locale === "es" ? "Actualizando catálogo…" : "Actualitzant el catàleg…"}</p>;
  if (error) return <p className="catalog-state error">{error}</p>;
  if (!products.length) return <p className="catalog-state">{locale === "es" ? "No hay productos publicados en este momento." : "No hi ha productes publicats en aquest moment."}</p>;

  return <div className="product-grid">{products.map((product, index) =>
    <Link href={`/${locale}/producto/${product.slug}`} className="product" key={product.id}>
      <div className={`product-image ${product.tone}`}><span>{String(index + 1).padStart(2, "0")}</span><div className="object"/></div>
      <div className="product-meta"><h3>{product.name}</h3><p>{product.price.toFixed(2)} EUR</p></div>
    </Link>)}</div>;
}
