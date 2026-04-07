/**
 * layout.js — Next.js App Router kök layout dosyası.
 *
 * Görev: Tüm sayfaları saran ortak yapıyı tanımlar.
 * → HeroUI Provider (bileşen kütüphanesi)
 * → Google Fonts (Inter)
 * → Global CSS
 * → SEO metadata
 */

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CollabFlow — Freelance İş & Proje Yönetimi",
  description: "Projelerinizi yönetin, yetenekli freelancer'larla çalışın.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
