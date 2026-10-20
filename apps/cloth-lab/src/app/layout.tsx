import type {Metadata} from "next";
import AppDocument from "@oskar-lab/platform-shell/AppDocument";
import AppLayout from "./AppLayout";

export const metadata: Metadata = {title: "ClothLab"};

/** Provides this application's document and replaceable page layout. */
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <AppDocument enableQueries><AppLayout>{children}</AppLayout></AppDocument>;
}
