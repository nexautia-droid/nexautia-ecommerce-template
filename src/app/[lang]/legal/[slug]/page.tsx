import Image from "next/image";
import { publicAsset } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/dictionaries";

const pages = {
  es: {
    ayuda: ["Ayuda", "Estamos aqu\u00ed para resolver dudas sobre productos, pedidos y entregas.", "En la versi\u00f3n final, cada comercio incluir\u00e1 sus datos de contacto y preguntas frecuentes."],
    "envios-devoluciones": ["Env\u00edos y devoluciones", "Los plazos, costes y zonas de entrega se mostrar\u00e1n antes de finalizar cada compra.", "La pol\u00edtica de devoluci\u00f3n ser\u00e1 configurable para cada empresa y producto."],
    privacidad: ["Pol\u00edtica de privacidad", "Los datos personales se tratar\u00e1n exclusivamente para gestionar pedidos, prestar el servicio y cumplir las obligaciones legales.", "Antes de publicar la tienda, este texto se adaptar\u00e1 al responsable real y a sus proveedores."],
    condiciones: ["Condiciones de compra", "Aqu\u00ed se identificar\u00e1 al vendedor y se detallar\u00e1n precios, impuestos, pagos y garant\u00edas.", "El contenido definitivo se adaptar\u00e1 a cada cliente antes de abrir la tienda al p\u00fablico."],
  },
  ca: {
    ajuda: ["Ajuda", "Som aqu\u00ed per resoldre dubtes sobre productes, comandes i lliuraments.", "A la versi\u00f3 final, cada comer\u00e7 inclour\u00e0 les seves dades de contacte i preguntes freq\u00fcents."],
    "enviaments-devolucions": ["Enviaments i devolucions", "Els terminis, costos i zones de lliurament es mostraran abans de finalitzar cada compra.", "La pol\u00edtica de devoluci\u00f3 ser\u00e0 configurable per a cada empresa i producte."],
    privacitat: ["Pol\u00edtica de privacitat", "Les dades personals es tractaran exclusivament per gestionar comandes, prestar el servei i complir les obligacions legals.", "Abans de publicar la botiga, aquest text s'adaptar\u00e0 al responsable real i als seus prove\u00efdors."],
    condicions: ["Condicions de compra", "Aqu\u00ed s'identificar\u00e0 el venedor i es detallaran preus, impostos, pagaments i garanties.", "El contingut definitiu s'adaptar\u00e0 a cada client abans d'obrir la botiga al p\u00fablic."],
  },
} as const;

export function generateStaticParams() {
  return Object.entries(pages).flatMap(([lang, group]) => Object.keys(group).map((slug) => ({ lang, slug })));
}

export default async function LegalPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const page = (pages[locale] as Record<string, readonly [string, string, string]>)[slug];
  if (!page) notFound();
  return <main className="legal-page">
    <header className="detail-header"><Link href={`/${locale}`}><Image src={publicAsset("/brand/logo.svg")} width={204} height={60} alt="Nexautia"/></Link><Link href={`/${locale}`}>{locale === "es" ? "Volver a la tienda" : "Tornar a la botiga"} &larr;</Link></header>
    <article className="legal-copy"><p className="eyebrow">Nexautia / E-commerce</p><h1>{page[0]}</h1><p>{page[1]}</p><p>{page[2]}</p><aside>{locale === "es" ? "Texto inicial de plantilla: deber\u00e1 revisarse con los datos reales de cada comercio." : "Text inicial de plantilla: s'haur\u00e0 de revisar amb les dades reals de cada comer\u00e7."}</aside></article>
  </main>;
}

