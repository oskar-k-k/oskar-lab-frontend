"use client";

import {SessionProvider} from "next-auth/react";

/** Provides the optional platform session to interactive client components. */
export default function AuthProvider({children}: Readonly<{children: React.ReactNode}>) {
    return <SessionProvider>{children}</SessionProvider>;
}
