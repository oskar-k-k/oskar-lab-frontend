import type {Metadata} from "next";
import AppDocument from "@oskar-lab/platform-shell/AppDocument";
import Header from "@oskar-lab/platform-shell/Header/Header";

export const metadata: Metadata = {title: "Workout · Oskar Lab"};

/** Shares the platform document, language and account controls. */
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <AppDocument><Header appName="Workout" />{children}</AppDocument>;
}
