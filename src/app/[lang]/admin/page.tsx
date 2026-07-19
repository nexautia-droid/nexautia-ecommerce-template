import { notFound } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";
import { locales, type Locale } from "@/lib/dictionaries";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  return <AdminPanel locale={lang as Locale} />;
}
