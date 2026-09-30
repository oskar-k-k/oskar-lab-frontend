import type {Metadata} from "next";
import {cookies} from "next/headers";
import I18nProvider from "@oskar-lab/i18n/I18nProvider";
import {parseLocale} from "@oskar-lab/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {title: "Inside a Language Model · Oskar Lab", description: "A cinematic, interactive journey through a language model."};

/** Provides the independent film document and the shared locale context. */
export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    const locale = parseLocale((await cookies()).get("oskar-lab-locale")?.value);
    return <html lang={locale}><body><I18nProvider initialLocale={locale}>{children}</I18nProvider></body></html>;
}
