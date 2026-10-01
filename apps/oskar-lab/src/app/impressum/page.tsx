import type {Metadata} from "next";
import LegalPage from "../account/LegalPage";
export const metadata: Metadata = {title: "Impressum | Oskar Lab", robots: {index: false, follow: true}};
/** Provides readable operator information, including without JavaScript. */
export default function ImprintPage() { return <LegalPage kind="imprint" />; }
