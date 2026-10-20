import { Geist, Geist_Mono } from "next/font/google";
import {cookies} from "next/headers";
import AuthProvider from "@oskar-lab/auth/AuthProvider";
import I18nProvider from "@oskar-lab/i18n/I18nProvider";
import {parseLocale} from "@oskar-lab/i18n/messages";
import LegalLinks from "./LegalLinks";
import AccountQueries from "./AccountQueries";
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
export default async function AppDocument({children, enableQueries = false}: Readonly<{
  children: React.ReactNode;
  /** Enables account-isolated server-state caching for apps with HTTP interactions. */
  enableQueries?: boolean;
}>) {
  const locale = parseLocale((await cookies()).get("oskar-lab-locale")?.value);
  return (

      <html
          lang={locale}
          className={`${geistSans.variable} ${geistMono.variable}`}
      >
      <body>
      <AuthProvider><I18nProvider initialLocale={locale}>{enableQueries ? <AccountQueries>{children}</AccountQueries> : children}<LegalLinks /></I18nProvider></AuthProvider>
      </body>
      </html>
  );
}
