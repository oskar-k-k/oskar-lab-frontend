import Header from "@/components/Header/Header";

export default function VirtualTryOnLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <><Header projectName="Virtual Try-On" />{children}</>;
}
