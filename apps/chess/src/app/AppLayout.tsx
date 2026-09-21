import Header from "@oskar-lab/platform-shell/Header/Header";
import StandardLayout from "@oskar-lab/ui/Layouts/StandardLayout";

export default function ChessLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header appName="Chess"/>

            <StandardLayout>
                {children}
            </StandardLayout>
        </>
    );
}