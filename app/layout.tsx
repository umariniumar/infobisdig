import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  description:
    "Informasi seputar jadwal kelas, tugas, pengumuman, kegiatan dan artikel referensi terkait bisnis digital tanpa scrolling WhatsApp Group lagi.",
  title: "Dashboard Informasi Terkurasi — Prodi S-1 Bisnis Digital, FEB UDS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bisdig-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
