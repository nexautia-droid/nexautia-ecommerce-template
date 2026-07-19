import { notFound } from "next/navigation";
import CartPageClient from "@/components/CartPageClient";
import { locales, type Locale } from "@/lib/dictionaries";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  return <CartPageClient lang={lang as Locale}/>;
}
