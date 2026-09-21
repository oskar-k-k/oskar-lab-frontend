/** Prefixes an app-local resource for integrated or standalone deployment. */
export function appPath(path: string): string {
    return `${process.env.NEXT_PUBLIC_APP_BASE_PATH ?? ""}${path}`;
}
