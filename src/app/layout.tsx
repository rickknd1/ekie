import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ekié — le courant est où ?",
  description:
    "App citoyenne : signale et suis en temps réel les coupures de courant dans ton quartier, au Cameroun.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Ekié", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0A0E14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
