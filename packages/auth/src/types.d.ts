import {type DefaultSession} from "next-auth";
import type {PlatformIdentity} from "./contracts";

declare module "next-auth" {
    interface Session {
        user: {id: string; provider: string; complete: boolean; termsVersion: string | null} & DefaultSession["user"];
        linkRequired?: boolean;
        accountError?: string;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        provider?: string;
        backendToken?: string;
        identity?: PlatformIdentity;
        pendingGoogle?: {subject: string; email: string; expires: number};
        accountError?: string;
    }
}
