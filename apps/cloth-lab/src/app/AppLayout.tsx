import Header from "@oskar-lab/platform-shell/Header/Header";

export default function VirtualTryOnLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <><Header appName="ClothLab" />{children}</>;
}
