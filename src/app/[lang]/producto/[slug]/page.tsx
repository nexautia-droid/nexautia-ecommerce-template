import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/dictionaries";
import { getCatalog, getProduct } from "@/lib/catalog";
import AddToCart from "@/components/AddToCart";
import CartIndicator from "@/components/CartIndicator";
import { publicAsset } from "@/lib/site";

export async function generateStaticParams() {
  const catalogs = await Promise.all(locales.map(async (lang) => ({ lang, products: await getCatalog(lang) })));
  return catalogs.flatMap(({ lang, products }) => products.map(({ slug }) => ({ lang, slug })));
}

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const product = await getProduct(locale, slug);
  if (!product) notFound();

  return <main className="detail-page">
    <header className="detail-header"><Link href={`/${locale}`}><Image src={publicAsset("/brand/logo.svg")} width={204} height={60} alt="Nexautia"/></Link><div><Link href={`/${locale}`}>{locale === "es" ? "Volver a la tienda" : "Tornar a la botiga"} &larr;</Link><CartIndicator lang={locale}/></div></header>
    <section className="product-detail">
      <div className={`product-image detail-image ${product.tone}`}><div className="object"/></div>
      <div className="detail-copy"><p className="eyebrow">Nexautia / {locale === "es" ? "Colecci\u00f3n" : "Col\u00b7lecci\u00f3"}</p><h1>{product.name}</h1><p className="detail-price">{product.price} EUR</p><p className="lead">{product.description}</p><AddToCart slug={slug} name={product.name} price={product.price} lang={locale}/><div className="detail-notes"><p>{locale === "es" ? "Env\u00edo trazable" : "Enviament tra\u00e7able"}</p><p>{locale === "es" ? "Devoluci\u00f3n configurable" : "Devoluci\u00f3 configurable"}</p><p>{locale === "es" ? "Pago seguro" : "Pagament segur"}</p><p>{product.stock} {locale === "es" ? "unidades disponibles" : "unitats disponibles"}</p></div></div>
    </section>
  </main>;
}

