import type { Metadata } from "next";
import { cookies } from "next/headers";
import I18nProvider from "@oskar-lab/i18n/I18nProvider";
import { parseLocale } from "@oskar-lab/i18n/messages";
import "@oskar-lab/ui/styles/globals.css";

export const metadata: Metadata = {
  title: "Room Studio · Oskar Lab",
  description: "A space for your ideas. Plan a real room in 3D.",
};

/** Supplies shared language and document defaults to the independent planner. */
export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = parseLocale((await cookies()).get("oskar-lab-locale")?.value);
  return (
    <html lang={locale}>
      <body>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
