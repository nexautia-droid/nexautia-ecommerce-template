"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCatalog, type CatalogProduct } from "@/lib/catalog";
import type { Locale } from "@/lib/dictionaries";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string };
type CategoryRow = { id: string; category_translations: Array<{ name: string }> };

const tones = ["sand", "sage", "clay"];

export default function StoreCatalog({ locale, categoriesTitle, productsTitle, edition, viewAll }: {
  locale: Locale;
  categoriesTitle: string;
  productsTitle: string;
  edition: string;
  viewAll: string;
}) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      getCatalog(locale),
      supabase.from("categories").select("id,category_translations!inner(name)").eq("is_active", true).eq("category_translations.locale", locale).order("sort_order"),
    ]).then(([catalog, categoryResult]) => {
      if (!active) return;
      if (categoryResult.error) throw categoryResult.error;
      setProducts(catalog);
      setCategories(((categoryResult.data ?? []) as CategoryRow[]).map((row) => ({ id: row.id, name: row.category_translations[0]?.name ?? "" })));
    }).catch(() => {
      if (active) setError(locale === "es" ? "No se ha podido actualizar el catálogo." : "No s'ha pogut actualitzar el catàleg.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [locale]);

  const categoryProducts = useMemo(() => selectedCategory ? products.filter((product) => product.categoryId === selectedCategory) : products, [products, selectedCategory]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (!normalizedQuery) return categoryProducts;
    return categoryProducts.filter((product) => `${product.name} ${product.description} ${product.slug}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery));
  }, [categoryProducts, query]);
  const shownProducts = filteredProducts.slice(0, visibleCount);
  const selectedName = categories.find((category) => category.id === selectedCategory)?.name;

  function selectCategory(categoryId: string | null) {
    setSelectedCategory(categoryId);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }));
  }

  return <>
    <section className="section categories" id="categorias" aria-labelledby="categories-title">
      <div className="section-heading"><p className="eyebrow">01 / {String(categories.length + 1).padStart(2, "0")}</p><h2 id="categories-title">{categoriesTitle}</h2></div>
      <div className="category-grid">
        <button type="button" onClick={() => selectCategory(null)} className={`category-card all-products ${selectedCategory === null ? "selected" : ""}`}><span>01</span><strong>{viewAll}</strong><i>→</i></button>
        {categories.map((category, index) => <button type="button" onClick={() => selectCategory(category.id)} className={`category-card ${tones[index % tones.length]} ${selectedCategory === category.id ? "selected" : ""}`} key={category.id}><span>{String(index + 2).padStart(2, "0")}</span><strong>{category.name}</strong><i>→</i></button>)}
      </div>
    </section>
    <section className="section products" id="productos" aria-labelledby="products-title">
      <div className="section-heading horizontal"><div><p className="eyebrow">{edition}</p><h2 id="products-title">{selectedName ?? productsTitle}</h2></div><button className="text-link catalog-all" type="button" onClick={() => selectCategory(null)}>{viewAll} →</button></div>
      <div className="catalog-toolbar">
        <label><span className="sr-only">{locale === "es" ? "Buscar productos" : "Cercar productes"}</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder={locale === "es" ? "Buscar por producto o palabra…" : "Cercar per producte o paraula…"}/></label>
        <span className="result-count">{filteredProducts.length} {locale === "es" ? (filteredProducts.length === 1 ? "resultado" : "resultados") : (filteredProducts.length === 1 ? "resultat" : "resultats")}</span>
        <button type="button" onClick={() => document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth" })}>↑ {locale === "es" ? "Volver a categorías" : "Tornar a categories"}</button>
      </div>
      {loading ? <p className="catalog-state">{locale === "es" ? "Actualizando catálogo…" : "Actualitzant el catàleg…"}</p>
        : error ? <p className="catalog-state error">{error}</p>
        : filteredProducts.length === 0 ? <p className="catalog-state empty">{query ? (locale === "es" ? "No se encontraron productos con esa búsqueda." : "No s'han trobat productes amb aquesta cerca.") : selectedCategory ? (locale === "es" ? "No hay productos en esta categoría." : "No hi ha productes en aquesta categoria.") : (locale === "es" ? "No hay productos publicados en este momento." : "No hi ha productes publicats en aquest moment.")}</p>
        : <><div className="product-grid">{shownProducts.map((product, index) => <Link href={`/${locale}/producto/${product.slug}`} className="product" key={product.id}><div className={`product-image ${product.tone}`}><span>{String(index + 1).padStart(2, "0")}</span><div className="object"/></div><div className="product-meta"><h3>{product.name}</h3><p>{product.price.toFixed(2)} EUR</p></div></Link>)}</div>{shownProducts.length < filteredProducts.length && <button className="load-more" type="button" onClick={() => setVisibleCount((count) => count + 12)}>{locale === "es" ? "Mostrar más productos" : "Mostrar més productes"}</button>}</>}
    </section>
  </>;
}
