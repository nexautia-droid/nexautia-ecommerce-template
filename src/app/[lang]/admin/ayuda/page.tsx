import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/dictionaries";
import { publicAsset } from "@/lib/site";

const guide = {
  es: {
    title: "Ayuda del panel", back: "Volver al panel", intro: "Guía práctica para gestionar los productos de la tienda.",
    sections: [
      ["Crear un producto", "Pulsa «Añadir producto». Escoge Castellano, Catalán o Ambos; completa nombre interno, categoría, estado, SKU, precio y stock. Después escribe el contenido de los idiomas elegidos y pulsa «Guardar producto»."],
      ["Borrador y publicación", "Un borrador queda guardado, pero no aparece en la tienda. Para mostrarlo, pulsa «Publicar» o edítalo y selecciona el estado «Publicado»."],
      ["Desactivar y recuperar", "«Desactivar» oculta temporalmente el producto sin perder ningún dato. Para recuperarlo, busca el mismo producto en el panel y pulsa «Publicar»."],
      ["Archivar", "Archivar conserva el producto como histórico y evita mostrarlo al público. Es apropiado para productos antiguos que quizá quieras consultar o recuperar."],
      ["Eliminar", "Eliminar borra definitivamente el producto, sus traducciones y sus variantes. No puede deshacerse. Si tienes dudas, utiliza «Desactivar» en lugar de eliminar."],
      ["Idiomas", "«Solo castellano» muestra el producto únicamente en la tienda española; «Solo catalán», únicamente en la catalana; «Castellano y catalán», en ambas. Los nombres y descripciones deben escribirse en cada idioma seleccionado."],
      ["SKU", "Es un código interno único para controlar inventario. Puedes crearlo tú siguiendo siempre el mismo criterio: NEX-JARRON-001, NEX-LAMPARA-001, etc."],
      ["Slug o dirección corta", "Es el final de la dirección web del producto. Se crea automáticamente a partir del nombre: «Jarrón Calma» se convierte en «jarron-calma». Normalmente no necesitas modificarlo."],
      ["SEO", "El título SEO y la descripción SEO ayudan a los buscadores a entender el producto. Son opcionales: si quedan vacíos, el panel utilizará el nombre y la descripción breve."],
    ],
  },
  ca: {
    title: "Ajuda del tauler", back: "Tornar al tauler", intro: "Guia pràctica per gestionar els productes de la botiga.",
    sections: [
      ["Crear un producte", "Prem «Afegir producte». Tria Castellà, Català o Tots dos; completa el nom intern, la categoria, l'estat, l'SKU, el preu i l'estoc. Després escriu el contingut dels idiomes triats i prem «Desar el producte»."],
      ["Esborrany i publicació", "Un esborrany queda desat, però no apareix a la botiga. Per mostrar-lo, prem «Publicar» o edita'l i selecciona l'estat «Publicat»."],
      ["Desactivar i recuperar", "«Desactivar» amaga temporalment el producte sense perdre cap dada. Per recuperar-lo, busca el mateix producte al tauler i prem «Publicar»."],
      ["Arxivar", "Arxivar conserva el producte com a històric i evita mostrar-lo al públic. És apropiat per a productes antics que potser voldràs consultar o recuperar."],
      ["Eliminar", "Eliminar esborra definitivament el producte, les traduccions i les variants. No es pot desfer. Si tens dubtes, utilitza «Desactivar» en lloc d'eliminar."],
      ["Idiomes", "«Només castellà» mostra el producte únicament a la botiga castellana; «Només català», únicament a la catalana; «Castellà i català», a totes dues. Els noms i les descripcions s'han d'escriure en cada idioma seleccionat."],
      ["SKU", "És un codi intern únic per controlar l'inventari. El pots crear seguint sempre el mateix criteri: NEX-GERRO-001, NEX-LLANTIA-001, etc."],
      ["Slug o adreça curta", "És el final de l'adreça web del producte. Es crea automàticament a partir del nom: «Gerro Calma» es converteix en «gerro-calma». Normalment no cal modificar-lo."],
      ["SEO", "El títol SEO i la descripció SEO ajuden els cercadors a entendre el producte. Són opcionals: si queden buits, el tauler utilitzarà el nom i la descripció breu."],
    ],
  },
};

export function generateStaticParams() { return locales.map((lang) => ({ lang })); }

export default async function AdminHelpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const content = guide[locale];
  return <main className="admin-help-page">
    <header className="admin-header"><Image src={publicAsset("/brand/logo.svg")} alt="Nexautia" width={135} height={43}/><Link href={`/${locale}/admin/`}>{content.back} &larr;</Link></header>
    <article className="admin-help-content"><p className="eyebrow">Nexautia</p><h1>{content.title}</h1><p className="help-intro">{content.intro}</p><div className="help-sections">{content.sections.map(([title, text], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}</div></article>
  </main>;
}
