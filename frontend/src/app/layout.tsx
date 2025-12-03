import type { Metadata } from "next";
import "./globals.css";
import { BegalFat, Dongle, overWatch, yChoi } from "@/fonts/local";

export const metadata: Metadata = {
  title: "Code Island",
  description: "Welcome to Code Island",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${yChoi.variable} ${overWatch.variable} ${BegalFat.variable} ${Dongle.variable}`}
    >
      <body className="flex flex-col min-h-screen SCROLLHIDDEN">
        <header></header>
        <main id="MainFrame" className="relative overflow-hidden">
          {children}
        </main>
        <footer></footer>
      </body>
    </html>
  );
}
