import {App, appsApi} from "@/lib/api/apps";
import AppsExplorer from "./AppsExplorer";

export const dynamic = "force-dynamic";

const localApps: App[] = [
    {
        id: -6,
        path: "workout",
        title: "Workout",
        description: "Reusable sessions and personal exercise plans.",
        thumbnail: "/catalog/workout/thumbnail.svg",
    },
    {
        id: -3,
        path: "portfolio",
        title: "Portfolio",
        description: "Software, ideas, and the person behind Oskar Lab.",
        thumbnail: "/catalog/portfolio/oskar.jpg",
    },
    {
        id: -2,
        path: "core-design",
        title: "Core & Design",
        description: "The living style guide for UI components, design tokens, and core utilities.",
        thumbnail: "/catalog/core/thumbnail.svg",
    },
    {
        id: -1,
        path: "chess",
        title: "Chess",
        description: "A complete chess game with all important rules.",
    },
    {
        id: -4,
        path: "cloth-lab",
        title: "ClothLab",
        description: "A self-hosted AI fitting room prototype for person and garment images.",
        thumbnail: "/catalog/virtual-try-on/thumbnail.svg",
    },
    {
        id: -5,
        path: "neon-vault",
        title: "Neon Vault",
        description: "A fictional-credit casino with blackjack, roulette, and slots.",
        thumbnail: "/catalog/neon-vault/thumbnail.svg",
    },
];

async function loadApps(): Promise<{apps: App[]; backendAvailable: boolean}> {
    try {
        const response = await appsApi.getAll();
        const remoteOnlyApps = response.content.filter(remoteApp => (
            !localApps.some(localApp => localApp.path === remoteApp.path)
        ));

        return {apps: [...localApps, ...remoteOnlyApps], backendAvailable: true};
    } catch {
        return {apps: localApps, backendAvailable: false};
    }
}

export default async function Home() {
    const {apps, backendAvailable} = await loadApps();
    return <AppsExplorer apps={apps} backendAvailable={backendAvailable} />;
}
