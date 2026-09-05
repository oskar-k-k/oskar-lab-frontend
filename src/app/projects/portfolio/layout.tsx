import Header from "@/components/Header/Header";

export default function PortfolioLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <><Header projectName="Portfolio" />{children}</>;
}
