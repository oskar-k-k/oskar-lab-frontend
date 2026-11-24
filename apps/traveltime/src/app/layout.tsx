import AppDocument from "@oskar-lab/platform-shell/AppDocument";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TravelTime · Oskar Lab",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppDocument>{children}</AppDocument>;
}
