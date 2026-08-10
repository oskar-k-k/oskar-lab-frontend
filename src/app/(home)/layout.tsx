import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";

export default function HomeLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header projectName="Projects" />

            <StandardLayout>
                {children}
            </StandardLayout>
        </>
    );
}