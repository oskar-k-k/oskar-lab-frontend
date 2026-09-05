import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {cookies} from "next/headers";
import I18nProvider from "@/lib/i18n/I18nProvider";
import {parseLocale} from "@/lib/i18n/messages";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oskar Lab",
  description: "A personal platform for interactive projects and experiments",
};

export default async function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = parseLocale((await cookies()).get("oskar-lab-locale")?.value);
  return (

      <html
          lang={locale}
          className={`${geistSans.variable} ${geistMono.variable}`}
      >
      <body>
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
      </html>
  );
}
