import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crisman P Turnip",
  description: "Ruang tempatnya membaca apapun yang disukai tanpa harus terikat dengan apapun"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins-latin-600-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
