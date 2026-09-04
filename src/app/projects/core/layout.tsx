import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";

export default function CoreLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <>
            <Header projectName="Core & Design" />
            <StandardLayout>{children}</StandardLayout>
        </>
    );
}
