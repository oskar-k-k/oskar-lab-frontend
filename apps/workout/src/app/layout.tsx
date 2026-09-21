import type {Metadata} from "next";
import AppDocument from "@oskar-lab/platform-shell/AppDocument";
import WorkoutHeader from "../components/WorkoutHeader";

export const metadata: Metadata = {title: "Workout · Oskar Lab"};

/** Shares the platform document, language and account controls. */
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <AppDocument><WorkoutHeader />{children}</AppDocument>;
}
