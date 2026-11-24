import "server-only";
import {getCurrentUser} from "@oskar-lab/auth/platformUser";
import {canAccessThailand} from "@oskar-lab/auth/privateProjects";

export async function hasAccess(): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        return canAccessThailand({user: user ? {...user, complete: true} : undefined});
    } catch { return false; }
}
export const privateHeaders = {"Cache-Control":"private, no-store, max-age=0", "X-Robots-Tag":"noindex, noarchive, nosnippet", "Referrer-Policy":"no-referrer", "X-Content-Type-Options":"nosniff"};
