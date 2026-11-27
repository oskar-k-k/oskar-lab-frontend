import AppDocument from "@oskar-lab/platform-shell/AppDocument";
import type { Metadata, Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0c111b" };
export const metadata: Metadata = {
  title: "TravelTime · Oskar Lab",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppDocument>{children}</AppDocument>;
}
