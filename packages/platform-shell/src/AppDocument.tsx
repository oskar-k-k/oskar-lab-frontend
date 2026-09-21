import { Geist, Geist_Mono } from "next/font/google";
import {cookies} from "next/headers";
import AuthProvider from "@oskar-lab/auth/AuthProvider";
import I18nProvider from "@oskar-lab/i18n/I18nProvider";
import {parseLocale} from "@oskar-lab/i18n/messages";
import "@oskar-lab/ui/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Provides shared document defaults; apps own their metadata and page layouts. */
export default async function AppDocument({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = parseLocale((await cookies()).get("oskar-lab-locale")?.value);
  return (

      <html
          lang={locale}
          className={`${geistSans.variable} ${geistMono.variable}`}
      >
      <body>
      <AuthProvider><I18nProvider initialLocale={locale}>{children}</I18nProvider></AuthProvider>
      </body>
      </html>
  );
}
