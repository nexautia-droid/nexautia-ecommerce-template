import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, locales, type Locale } from "@/lib/dictionaries";
import CartIndicator from "@/components/CartIndicator";
import CatalogGrid from "@/components/CatalogGrid";
import { publicAsset, publicSiteUrl } from "@/lib/site";

const categories = [
  { tone: "sand", number: "01" },
  { tone: "sage", number: "02" },
  { tone: "clay", number: "03" },
];

export function generateStaticParams() { return locales.map((lang) => ({ lang })); }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) return {};
  const d = getDictionary(lang as Locale);
  return {
    title: d.title,
    description: d.intro,
    alternates: { canonical: `/${lang}`, languages: { es: "/es", ca: "/ca", "x-default": "/es" } },
    openGraph: { title: d.title, description: d.intro, locale: lang === "ca" ? "ca_ES" : "es_ES", type: "website" },
  };
}
export default async function Storefront({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const d = getDictionary(locale);
  const other = locale === "es" ? "ca" : "es";
  const structuredData = {
    "@context": "https://schema.org", "@type": "OnlineStore", name: "Nexautia Shop",
    url: `${publicSiteUrl}/${locale}`, inLanguage: locale,
    description: d.intro, currenciesAccepted: "EUR",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div id="top" className="announcement">{d.announcement}</div>
      <header className="site-header">
        <Link href={`/${locale}`} className="brand" aria-label="Nexautia Shop">
          <Image src={publicAsset("/brand/logo.svg")} width={204} height={60} alt="Nexautia" priority />
        </Link>
        <nav aria-label={d.mainNavLabel}>{d.nav.map((item) => <a href="#productos" key={item}>{item}</a>)}</nav>
        <div className="header-actions">
          <button aria-label={d.search}>⌕</button><button>{d.account}</button><CartIndicator lang={locale}/>
          <Link className="language" href={`/${other}`} hrefLang={other}>{other.toUpperCase()}</Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{d.eyebrow}</p><h1>{d.title}</h1><p className="lead">{d.intro}</p>
            <div className="hero-actions"><a className="button primary" href="#productos">{d.cta}</a><a className="text-link" href="#historia">{d.secondary} →</a></div>
          </div>
          <div className="hero-art" aria-label={d.heroArtLabel}><span className="orb orb-one"/><span className="orb orb-two"/><span className="vase"/><span className="pedestal"/></div>
        </section>

        <section className="section categories" aria-labelledby="categories-title">
          <div className="section-heading"><p className="eyebrow">01 / 03</p><h2 id="categories-title">{d.categoriesTitle}</h2></div>
          <div className="category-grid">{categories.map((category, index) => <a href="#productos" className={`category-card ${category.tone}`} key={category.number}><span>{category.number}</span><strong>{d.categoryNames[index]}</strong><i>→</i></a>)}</div>
        </section>

        <section className="section products" id="productos" aria-labelledby="products-title">
          <div className="section-heading horizontal"><div><p className="eyebrow">{d.edition}</p><h2 id="products-title">{d.productsTitle}</h2></div><a className="text-link" href="#productos">{d.viewAll} →</a></div>
          <CatalogGrid locale={locale}/>
        </section>

        <section className="story" id="historia"><p className="eyebrow">Nexautia / Template</p><blockquote>{locale === "es" ? "Una tienda no deber\u00eda parecer un cat\u00e1logo infinito. Deber\u00eda sentirse como una buena conversaci\u00f3n." : "Una botiga no hauria de semblar un cat\u00e0leg infinit. Hauria de sentir-se com una bona conversa."}</blockquote><p>{locale === "es" ? "Dise\u00f1o sobrio, contenido comprensible y tecnolog\u00eda preparada para crecer con cada marca." : "Disseny sobri, contingut entenedor i tecnologia preparada per cr\u00e9ixer amb cada marca."}</p><a className="back-top" href="#top">{locale === "es" ? "Volver arriba" : "Tornar a dalt"} &uarr;</a></section>
        <section className="values">{d.values.map((value, index) => <div key={value}><span>0{index + 1}</span><strong>{value}</strong></div>)}</section>
        <section className="newsletter"><div><p className="eyebrow">Newsletter</p><h2>{d.newsletter}</h2></div><form><label className="sr-only" htmlFor="email">{d.email}</label><input id="email" type="email" placeholder={d.email}/><button type="submit">{d.subscribe} →</button></form></section>
      </main>

      <footer><Image src={publicAsset("/brand/logo.svg")} width={204} height={60} alt="Nexautia"/><div>{d.footer.map((item, index) => <Link href={`/${locale}/legal/${locale === "es" ? ["ayuda", "envios-devoluciones", "privacidad", "condiciones"][index] : ["ajuda", "enviaments-devolucions", "privacitat", "condicions"][index]}`} key={item}>{item}</Link>)}</div><p>© 2026 Nexautia. Template e-commerce.</p></footer>
    </>
  );
}


