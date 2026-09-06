import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";

export default function NeonVaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header projectName="Neon Vault" />

            <StandardLayout>
                {children}
            </StandardLayout>
        </>
    );
}
