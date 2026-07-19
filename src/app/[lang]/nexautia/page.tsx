import { notFound } from "next/navigation";
import NexautiaControlPanel from "@/components/NexautiaControlPanel";
import { locales, type Locale } from "@/lib/dictionaries";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function NexautiaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  return <NexautiaControlPanel locale={lang as Locale} />;
}
