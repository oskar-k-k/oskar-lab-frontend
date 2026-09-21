import Header from "@oskar-lab/platform-shell/Header/Header";

export default function PortfolioLayout({children}: Readonly<{children: React.ReactNode}>) {
    return <><Header appName="Portfolio" />{children}</>;
}
