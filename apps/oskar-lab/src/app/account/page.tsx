import {auth, authProviders} from "@oskar-lab/auth/server";
import {redirect} from "next/navigation";
import {safeReturnPath} from "@oskar-lab/auth/contracts";
import AccountForm from "./AccountForm";

/** Central account entry point for every platform app. */
export default async function AccountPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const query = await searchParams;
    const session = await auth();
    const returnTo = safeReturnPath(query.returnTo);
    if (session?.user.complete && query.continue === "1" && !query.error) redirect(returnTo);
    return <AccountForm googleAvailable={authProviders.google} returnTo={returnTo} oauthError={Boolean(query.error)} initialSession={session} />;
}
