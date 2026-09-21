import {authProviders} from "@oskar-lab/auth/server";
import {safeReturnPath} from "@oskar-lab/auth/contracts";
import AccountForm from "./AccountForm";

/** Central account entry point for every platform app. */
export default async function AccountPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const query = await searchParams;
    return <AccountForm googleAvailable={authProviders.google} returnTo={safeReturnPath(query.returnTo)} oauthError={Boolean(query.error)} />;
}
