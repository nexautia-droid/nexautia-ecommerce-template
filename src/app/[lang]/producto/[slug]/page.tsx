import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/dictionaries";
import AddToCart from "@/components/AddToCart";
import CartIndicator from "@/components/CartIndicator";

const items = [
  { slug: "jarron-calma", tone: "product-a", price: 48, es: ["Jarr\u00f3n Calma", "Jarr\u00f3n de l\u00edneas org\u00e1nicas para flores o como pieza decorativa."], ca: ["Gerro Calma", "Gerro de l\u00ednies org\u00e0niques per a flors o com a pe\u00e7a decorativa."] },
  { slug: "lampara-alba", tone: "product-b", price: 89, es: ["L\u00e1mpara Alba", "Luz c\u00e1lida y difusa para crear una atm\u00f3sfera tranquila."], ca: ["Ll\u00e0ntia Alba", "Llum c\u00e0lida i difusa per crear una atmosfera tranquil\u00b7la."] },
  { slug: "bandeja-origen", tone: "product-c", price: 36, es: ["Bandeja Origen", "Bandeja vers\u00e1til para servir o mantener en orden los objetos cotidianos."], ca: ["Safata Origen", "Safata vers\u00e0til per servir o mantenir endre\u00e7ats els objectes quotidians."] },
  { slug: "textil-bruma", tone: "product-d", price: 52, es: ["Textil Bruma", "Tejido suave de tacto natural pensado para acompa\u00f1ar el hogar."], ca: ["T\u00e8xtil Bruma", "Teixit suau de tacte natural pensat per acompanyar la llar."] },
] as const;

export function generateStaticParams() {
  return locales.flatMap((lang) => items.map(({ slug }) => ({ lang, slug })));
}

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const product = items.find((item) => item.slug === slug);
  if (!product) notFound();
  const locale = lang as Locale;
  const [name, description] = product[locale];
  return <main className="detail-page">
    <header className="detail-header"><Link href={`/${locale}`}><Image src="/brand/logo.svg" width={204} height={60} alt="Nexautia"/></Link><div><Link href={`/${locale}`}>{locale === "es" ? "Volver a la tienda" : "Tornar a la botiga"} &larr;</Link><CartIndicator lang={locale}/></div></header>
    <section className="product-detail">
      <div className={`product-image detail-image ${product.tone}`}><div className="object"/></div>
      <div className="detail-copy"><p className="eyebrow">Nexautia / {locale === "es" ? "Colecci\u00f3n" : "Col\u00b7lecci\u00f3"}</p><h1>{name}</h1><p className="detail-price">{product.price} EUR</p><p className="lead">{description}</p><AddToCart slug={slug} name={name} price={product.price} lang={locale}/><div className="detail-notes"><p>{locale === "es" ? "Env\u00edo trazable" : "Enviament tra\u00e7able"}</p><p>{locale === "es" ? "Devoluci\u00f3n configurable" : "Devoluci\u00f3 configurable"}</p><p>{locale === "es" ? "Pago seguro" : "Pagament segur"}</p></div></div>
    </section>
  </main>;
}
