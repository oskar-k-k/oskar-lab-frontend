import type {Metadata} from "next";
import AppDocument from "@oskar-lab/platform-shell/AppDocument";
export const metadata: Metadata = {title: "Privater Bereich · Oskar Lab", robots: {index:false, follow:false}, referrer:"no-referrer"};
export default function Layout({children}: {children: React.ReactNode}) {return <AppDocument>{children}</AppDocument>;}
