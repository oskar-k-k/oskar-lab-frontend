import "server-only";
import {getCurrentUser} from "@oskar-lab/auth/platformUser";
import {canAccessThailand} from "@oskar-lab/auth/privateProjects";

/** Returns an allowed Google identity; account-service failures deny private access. */
export async function authorizedUser() {
    try {
        const user = await getCurrentUser();
        return canAccessThailand({user: user ? {...user, complete: true} : undefined}) ? user : null;
    } catch { return null; }
}
export async function hasAccess(): Promise<boolean> { return Boolean(await authorizedUser()); }
export const privateHeaders = {"Cache-Control":"private, no-store, max-age=0", "X-Robots-Tag":"noindex, noarchive, nosnippet", "Referrer-Policy":"no-referrer", "X-Content-Type-Options":"nosniff"};
