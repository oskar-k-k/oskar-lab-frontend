import type {Metadata} from "next";
import "./style.css";
export const metadata: Metadata = {title: "Tierlist Matcher — gleicher Begriff, eure Rankings", description: "Erstelle eine Lobby, ordnet gemeinsam Begriffe ein und vergleicht eure Tierlisten nach jeder Runde."};
export default function Layout({children}: {children: React.ReactNode}) {
    return <html lang="de"><body>{children}</body></html>;
}
