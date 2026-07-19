"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/dictionaries";
import { publicAsset } from "@/lib/site";
import { supabase } from "@/lib/supabase";

type Translation = {
  locale: Locale;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  seo_title: string;
  seo_description: string;
};

type Product = {
  id: string;
  category_id: string | null;
  internal_name: string;
  status: "draft" | "active" | "archived";
  product_translations: Translation[];
  product_variants: Array<{ id: string; sku: string; internal_name: string; price_cents: number; stock_quantity: number; is_active: boolean }>;
};

type Category = { id: string; internal_name: string };

const copy = {
  es: {
    panel: "Panel de administración", store: "Ver tienda", logout: "Cerrar sesión", login: "Acceso de administración",
    intro: "Gestiona el catálogo sin modificar el código.", email: "Correo electrónico", password: "Contraseña", enter: "Entrar",
    noAccess: "Este usuario no tiene permisos de administración.", products: "Productos", add: "Añadir producto", edit: "Editar",
    hide: "Desactivar", publish: "Publicar", remove: "Eliminar", empty: "Todavía no hay productos.", internal: "Nombre interno",
    category: "Categoría", none: "Sin categoría", status: "Estado", draft: "Borrador", active: "Publicado", archived: "Archivado",
    sku: "SKU", price: "Precio (EUR)", stock: "Unidades en stock", spanish: "Contenido en castellano", catalan: "Contenido en catalán",
    name: "Nombre", slug: "Dirección corta (slug)", short: "Descripción breve", description: "Descripción completa", seoTitle: "Título SEO",
    seoDescription: "Descripción SEO (opcional)", save: "Guardar producto", cancel: "Cancelar", saving: "Guardando…", saved: "Producto guardado.",
    internalHelp: "Referencia privada; no se muestra en la tienda. Ejemplo: Jarrón Calma.",
    skuHelp: "Código único de inventario. Ejemplo: NEX-JARRON-001.",
    slugHelp: "Final de la dirección web. Se genera desde el nombre. Ejemplo: jarron-calma.",
    shortHelp: "Resumen de una frase para entender rápidamente el producto.",
    descriptionHelp: "Explica materiales, medidas, uso, cuidados e información importante para la compra.",
    seoTitleHelp: "Título que puede aparecer en Google. Vacío: utilizaremos el nombre.",
    seoDescriptionHelp: "Resumen para buscadores, idealmente 140–160 caracteres. Vacío: utilizaremos la descripción breve.",
    confirmDelete: "¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.", required: "Completa los nombres, slugs, SKU y precio.",
    loadError: "No se pudo cargar el panel", authError: "No se pudo iniciar la sesión", deleteError: "No se pudo eliminar el producto", statusUpdated: "Estado actualizado. El catálogo público cambiará al recargar la tienda.",
  },
  ca: {
    panel: "Tauler d'administració", store: "Veure la botiga", logout: "Tancar la sessió", login: "Accés d'administració",
    intro: "Gestiona el catàleg sense modificar el codi.", email: "Correu electrònic", password: "Contrasenya", enter: "Entrar",
    noAccess: "Aquest usuari no té permisos d'administració.", products: "Productes", add: "Afegir producte", edit: "Editar",
    hide: "Desactivar", publish: "Publicar", remove: "Eliminar", empty: "Encara no hi ha productes.", internal: "Nom intern",
    category: "Categoria", none: "Sense categoria", status: "Estat", draft: "Esborrany", active: "Publicat", archived: "Arxivat",
    sku: "SKU", price: "Preu (EUR)", stock: "Unitats en estoc", spanish: "Contingut en castellà", catalan: "Contingut en català",
    name: "Nom", slug: "Adreça curta (slug)", short: "Descripció breu", description: "Descripció completa", seoTitle: "Títol SEO",
    seoDescription: "Descripció SEO (opcional)", save: "Desar el producte", cancel: "Cancel·lar", saving: "Desant…", saved: "Producte desat.",
    internalHelp: "Referència privada; no es mostra a la botiga. Exemple: Gerro Calma.",
    skuHelp: "Codi únic d'inventari. Exemple: NEX-GERRO-001.",
    slugHelp: "Final de l'adreça web. Es genera des del nom. Exemple: gerro-calma.",
    shortHelp: "Resum d'una frase per entendre ràpidament el producte.",
    descriptionHelp: "Explica materials, mides, ús, cura i informació important per a la compra.",
    seoTitleHelp: "Títol que pot aparèixer a Google. Buit: utilitzarem el nom.",
    seoDescriptionHelp: "Resum per als cercadors, idealment 140–160 caràcters. Buit: utilitzarem la descripció breu.",
    confirmDelete: "Segur que vols eliminar aquest producte? Aquesta acció no es pot desfer.", required: "Completa els noms, els slugs, l'SKU i el preu.",
    loadError: "No s'ha pogut carregar el tauler", authError: "No s'ha pogut iniciar la sessió", deleteError: "No s'ha pogut eliminar el producte", statusUpdated: "Estat actualitzat. El catàleg públic canviarà en recarregar la botiga.",
  },
};

const blankTranslation = (locale: Locale): Translation => ({ locale, name: "", slug: "", short_description: "", description: "", seo_title: "", seo_description: "" });
const blankForm = () => ({ id: "", internal_name: "", category_id: "", status: "draft" as Product["status"], sku: "", price: "", stock: "0", es: blankTranslation("es"), ca: blankTranslation("ca") });
type ProductForm = ReturnType<typeof blankForm>;

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPanel({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCatalog = useCallback(async () => {
    const [productResult, categoryResult] = await Promise.all([
      supabase.from("products").select("id,category_id,internal_name,status,product_translations(locale,name,slug,short_description,description,seo_title,seo_description),product_variants(id,sku,internal_name,price_cents,stock_quantity,is_active)").order("created_at"),
      supabase.from("categories").select("id,internal_name").order("sort_order"),
    ]);
    if (productResult.error) throw productResult.error;
    if (categoryResult.error) throw categoryResult.error;
    setProducts((productResult.data ?? []) as Product[]);
    setCategories((categoryResult.data ?? []) as Category[]);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: allowed } = await supabase.rpc("is_staff");
        if (!active) return;
        setStaff(Boolean(allowed));
        if (allowed) await loadCatalog().catch((reason) => setError(`${t.loadError}: ${reason.message}`));
      }
      setLoading(false);
    }
    initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadCatalog, t.loadError]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (result.error) { setError(`${t.authError}: ${result.error.message}`); setLoading(false); return; }
    const { data: allowed } = await supabase.rpc("is_staff");
    setUser(result.data.user); setStaff(Boolean(allowed));
    if (allowed) await loadCatalog().catch((reason) => setError(`${t.loadError}: ${reason.message}`));
    setLoading(false);
  }

  function editProduct(product?: Product) {
    if (!product) { setEditing(blankForm()); return; }
    const es = product.product_translations.find((item) => item.locale === "es") ?? blankTranslation("es");
    const ca = product.product_translations.find((item) => item.locale === "ca") ?? blankTranslation("ca");
    const variant = product.product_variants[0];
    setEditing({ id: product.id, internal_name: product.internal_name, category_id: product.category_id ?? "", status: product.status, sku: variant?.sku ?? "", price: variant ? (variant.price_cents / 100).toFixed(2) : "", stock: String(variant?.stock_quantity ?? 0), es, ca });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateTranslation(language: Locale, field: keyof Translation, value: string) {
    setEditing((current) => current ? { ...current, [language]: { ...current[language], [field]: value } } : current);
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!editing || !editing.internal_name || !editing.es.name || !editing.ca.name || !editing.es.slug || !editing.ca.slug || !editing.sku || editing.price === "") { setError(t.required); return; }
    setSaving(true); setError(""); setNotice("");
    let productId = editing.id;
    const productValues = { internal_name: editing.internal_name, category_id: editing.category_id || null, status: editing.status };
    const productResult = productId
      ? await supabase.from("products").update(productValues).eq("id", productId).select("id").single()
      : await supabase.from("products").insert(productValues).select("id").single();
    if (productResult.error) { setError(productResult.error.message); setSaving(false); return; }
    productId = productResult.data.id;
    const translations = [editing.es, editing.ca].map((item) => ({
      ...item,
      seo_title: item.seo_title.trim() || item.name,
      seo_description: item.seo_description.trim() || item.short_description.trim() || item.description.trim(),
      product_id: productId,
    }));
    const translationResult = await supabase.from("product_translations").upsert(translations, { onConflict: "product_id,locale" });
    const existingVariant = products.find((item) => item.id === productId)?.product_variants[0];
    const variantValues = { product_id: productId, sku: editing.sku, internal_name: "Única", price_cents: Math.round(Number(editing.price.replace(",", ".")) * 100), stock_quantity: Math.max(0, Number.parseInt(editing.stock) || 0), is_active: true };
    const variantResult = existingVariant
      ? await supabase.from("product_variants").update(variantValues).eq("id", existingVariant.id)
      : await supabase.from("product_variants").insert(variantValues);
    if (translationResult.error || variantResult.error) setError((translationResult.error ?? variantResult.error)?.message ?? "Error");
    else { await loadCatalog(); setEditing(null); setNotice(t.saved); }
    setSaving(false);
  }

  async function toggleProduct(product: Product) {
    const status = product.status === "active" ? "draft" : "active";
    const { error: updateError } = await supabase.from("products").update({ status }).eq("id", product.id);
    if (updateError) setError(updateError.message); else { await loadCatalog(); setNotice(t.statusUpdated); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(t.confirmDelete)) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
    if (deleteError) setError(`${t.deleteError}: ${deleteError.message}`); else await loadCatalog();
  }

  if (loading) return <main className="admin-shell"><p>{t.saving}</p></main>;
  if (!user) return <main className="admin-login"><form onSubmit={login}><Image src={publicAsset("/brand/logo.svg")} alt="Nexautia" width={150} height={48}/><p className="eyebrow">{t.panel}</p><h1>{t.login}</h1><p>{t.intro}</p><label>{t.email}<input name="email" type="email" required autoComplete="username"/></label><label>{t.password}<input name="password" type="password" required autoComplete="current-password"/></label>{error && <p className="admin-error">{error}</p>}<button className="admin-primary" type="submit">{t.enter}</button></form></main>;
  if (!staff) return <main className="admin-login"><section><h1>{t.noAccess}</h1><button className="admin-primary" onClick={() => supabase.auth.signOut().then(() => setUser(null))}>{t.logout}</button></section></main>;

  return <main className="admin-shell">
    <header className="admin-header"><Image src={publicAsset("/brand/logo.svg")} alt="Nexautia" width={135} height={43}/><div><a href={publicAsset(`/${locale}/`)}>{t.store}</a><a href={publicAsset(`/${locale === "es" ? "ca" : "es"}/admin/`)}>{locale === "es" ? "CA" : "ES"}</a><button onClick={() => supabase.auth.signOut().then(() => { setUser(null); setStaff(false); })}>{t.logout}</button></div></header>
    <section className="admin-content">
      <div className="admin-title"><div><p className="eyebrow">Nexautia</p><h1>{t.panel}</h1><p>{t.intro}</p></div>{!editing && <button className="admin-primary" onClick={() => editProduct()}>{t.add}</button>}</div>
      {error && <p className="admin-error">{error}</p>}{notice && <p className="admin-notice">{notice}</p>}
      {editing ? <form className="product-form" onSubmit={saveProduct}>
        <div className="form-grid compact"><label>{t.internal}<input value={editing.internal_name} onChange={(e) => setEditing({ ...editing, internal_name: e.target.value })} required/><small>{t.internalHelp}</small></label><label>{t.category}<select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}><option value="">{t.none}</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.internal_name}</option>)}</select></label><label>{t.status}<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Product["status"] })}><option value="draft">{t.draft}</option><option value="active">{t.active}</option><option value="archived">{t.archived}</option></select></label><label>{t.sku}<input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value.toUpperCase() })} required/><small>{t.skuHelp}</small></label><label>{t.price}<input type="number" min="0" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required/></label><label>{t.stock}<input type="number" min="0" step="1" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })}/></label></div>
        {(["es", "ca"] as Locale[]).map((language) => <fieldset key={language}><legend>{language === "es" ? t.spanish : t.catalan}</legend><div className="form-grid"><label>{t.name}<input value={editing[language].name} onChange={(e) => { const name = e.target.value; updateTranslation(language, "name", name); if (!editing[language].slug) updateTranslation(language, "slug", slugify(name)); }} required/></label><label>{t.slug}<input value={editing[language].slug} onChange={(e) => updateTranslation(language, "slug", slugify(e.target.value))} required/><small>{t.slugHelp}</small></label><label className="wide">{t.short}<input value={editing[language].short_description ?? ""} onChange={(e) => updateTranslation(language, "short_description", e.target.value)}/><small>{t.shortHelp}</small></label><label className="wide">{t.description}<textarea value={editing[language].description ?? ""} onChange={(e) => updateTranslation(language, "description", e.target.value)}/><small>{t.descriptionHelp}</small></label><label>{t.seoTitle}<input value={editing[language].seo_title ?? ""} onChange={(e) => updateTranslation(language, "seo_title", e.target.value)}/><small>{t.seoTitleHelp}</small></label><label>{t.seoDescription}<textarea maxLength={160} value={editing[language].seo_description ?? ""} onChange={(e) => updateTranslation(language, "seo_description", e.target.value)}/><small>{t.seoDescriptionHelp}</small></label></div></fieldset>)}
        <div className="form-actions"><button type="button" onClick={() => setEditing(null)}>{t.cancel}</button><button className="admin-primary" disabled={saving}>{saving ? t.saving : t.save}</button></div>
      </form> : <section className="admin-products"><h2>{t.products}</h2>{products.length === 0 ? <p>{t.empty}</p> : <div className="admin-table">{products.map((product) => { const translation = product.product_translations.find((item) => item.locale === locale); const variant = product.product_variants[0]; return <article key={product.id}><div><strong>{translation?.name ?? product.internal_name}</strong><span>{product.internal_name} · {variant?.sku}</span></div><span className={`status ${product.status}`}>{product.status === "active" ? t.active : product.status === "draft" ? t.draft : t.archived}</span><span>{variant ? `${(variant.price_cents / 100).toFixed(2)} € · ${variant.stock_quantity} ${t.stock.toLowerCase()}` : "—"}</span><div className="row-actions"><button onClick={() => editProduct(product)}>{t.edit}</button><button onClick={() => toggleProduct(product)}>{product.status === "active" ? t.hide : t.publish}</button><button className="danger" onClick={() => deleteProduct(product)}>{t.remove}</button></div></article>; })}</div>}</section>}
    </section>
  </main>;
}
