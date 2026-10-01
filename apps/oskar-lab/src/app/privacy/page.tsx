import LegalPage from "../account/LegalPage";
import type {Metadata} from "next";
export const metadata: Metadata = {title: "Privacy | Oskar Lab", robots: {index: false, follow: true}};
export default function PrivacyPage() { return <LegalPage kind="privacy" />; }
