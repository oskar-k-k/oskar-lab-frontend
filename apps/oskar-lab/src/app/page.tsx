import {App, appsApi} from "@/lib/api/apps";
import AppsExplorer from "./AppsExplorer";
import {auth} from "@oskar-lab/auth/server";
import {canAccessThailand} from "@oskar-lab/auth/privateProjects";

export const dynamic = "force-dynamic";

const localApps: App[] = [
    {id: -10, path: "tierlist-matcher", title: "Tierlist Matcher", description: "Rank together, reveal your choices and compare your complete tierlists.", thumbnail: "/catalog/tierlist-matcher/thumbnail.svg"},
    {id: -9, path: "inside-llm", title: "Inside a Language Model", description: "A cinematic journey from prompt to prediction.", thumbnail: "/catalog/inside-llm/thumbnail.svg"},
    {id: -8, path: '2d-lab', title: '2D Lab', description: 'An independent SVG scene and mesh editor.', thumbnail: '/catalog/2d-lab/thumbnail.svg'},
    {id: -7, path: 'room-studio', title: 'Room Studio', description: 'Plan your real room in 3D.', thumbnail: '/catalog/room-studio/thumbnail.svg'},
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

async function loadRemoteApps() {
    let remoteApps: App[] = [];
    let backendAvailable = false;
    try {
        remoteApps = (await appsApi.getAll()).content;
        backendAvailable = true;
    } catch { /* The local catalog remains usable while the backend is unavailable. */ }
    return {initialRemoteApps: remoteApps, backendAvailable, fetchedAt: Date.now()};
}

export default async function Home() {
    const loaded = await loadRemoteApps();
    const visible = [...localApps];
    if (canAccessThailand(await auth())) visible.unshift({id: -11, path: "thailand", title: "Thailand · Unsere Reise", description: "Eure private Reise-Timeline mit Flügen, Erlebnissen und Tickets.", thumbnail: "/apps/thailand/cover"});
    return <AppsExplorer localApps={visible} {...loaded} initialRemoteApps={loaded.initialRemoteApps.filter(app => app.path !== "thailand")} />;
}
