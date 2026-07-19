import type { Metadata } from "next";
import "./globals.css";
import { publicSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: { default: "Nexautia Shop", template: "%s | Nexautia Shop" },
  description: "Plantilla de comercio electronico bilingue, rapida y reutilizable.",
  icons: { icon: `${publicSiteUrl}/icon.svg` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
