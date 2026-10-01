import type {Metadata} from "next";
import PrivacyContent from "./PrivacyContent";
export const metadata: Metadata = {title: "Modern Reading Privacy Policy", robots: {index: false, follow: true}};
export default function Page() { return <PrivacyContent />; }
