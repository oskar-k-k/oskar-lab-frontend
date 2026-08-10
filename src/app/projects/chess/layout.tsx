import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";

export default function ChessLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header projectName="Chess"/>

            <StandardLayout>
                {children}
            </StandardLayout>
        </>
    );
}