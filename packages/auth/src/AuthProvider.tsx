"use client";

import {SessionProvider} from "next-auth/react";

/** Provides the optional platform session to interactive client components. */
export default function AuthProvider({children}: Readonly<{children: React.ReactNode}>) {
    if (process.env.NEXT_PUBLIC_PLATFORM_SHELL === "standalone") return children;
    return <SessionProvider>{children}</SessionProvider>;
}
