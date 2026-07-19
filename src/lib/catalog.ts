import type { Locale } from "@/lib/dictionaries";
import { supabase } from "@/lib/supabase";

export type CatalogProduct = {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  price: number;
  stock: number;
  tone: string;
};

type CatalogRow = {
  id: string;
  category_id: string | null;
  product_translations: Array<{ name: string; slug: string; description: string | null; seo_title: string | null; seo_description: string | null }>;
  product_variants: Array<{ price_cents: number; stock_quantity: number }>;
  product_images: Array<{ storage_path: string; sort_order: number }>;
};

export async function getCatalog(locale: Locale): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,category_id, product_translations!inner(name,slug,description,seo_title,seo_description), product_variants!inner(price_cents,stock_quantity,is_active), product_images(storage_path,sort_order)")
    .eq("status", "active")
    .eq("product_translations.locale", locale)
    .eq("product_variants.is_active", true)
    .order("created_at");

  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);

  return ((data ?? []) as CatalogRow[]).flatMap((row) => {
    const translation = row.product_translations[0];
    const variant = row.product_variants[0];
    const image = [...row.product_images].sort((left, right) => left.sort_order - right.sort_order)[0];
    if (!translation || !variant) return [];
    return [{
      id: row.id,
      categoryId: row.category_id,
      name: translation.name,
      slug: translation.slug,
      description: translation.description ?? "",
      seoTitle: translation.seo_title ?? translation.name,
      seoDescription: translation.seo_description ?? translation.description ?? "",
      price: variant.price_cents / 100,
      stock: variant.stock_quantity,
      tone: image?.storage_path ?? "product-a",
    }];
  });
}

export async function getProduct(locale: Locale, slug: string) {
  return (await getCatalog(locale)).find((product) => product.slug === slug) ?? null;
}
