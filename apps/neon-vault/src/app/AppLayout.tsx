import Header from "@oskar-lab/platform-shell/Header/Header";
import StandardLayout from "@oskar-lab/ui/Layouts/StandardLayout";

export default function NeonVaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header appName="Neon Vault" />

            <StandardLayout>
                {children}
            </StandardLayout>
        </>
    );
}
