"use client";

import {useSession} from "next-auth/react";
import QueryProvider from "@oskar-lab/query/QueryProvider";

/** Discards cached requests and app-local drafts whenever the account identity changes. */
export default function AccountQueries({children}: Readonly<{children: React.ReactNode}>) {
    const {data} = useSession();
    return <QueryProvider key={data?.user?.id ?? "guest"}>{children}</QueryProvider>;
}
