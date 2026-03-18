import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreICFES Pro — Simulacros Inteligentes",
  description: "Prepárate para la prueba Saber 11 con simulacros personalizados, calificación automática y retroalimentación detallada.",
  keywords: ["PreICFES", "simulacro", "Saber 11", "ICFES", "examen", "preparación"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
