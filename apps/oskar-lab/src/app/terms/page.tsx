import LegalPage from "../account/LegalPage";
import type {Metadata} from "next";
export const metadata: Metadata = {title: "Terms | Oskar Lab", robots: {index: false, follow: true}};
export default function TermsPage() { return <LegalPage kind="terms" />; }
