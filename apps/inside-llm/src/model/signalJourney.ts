import {LAYER_COUNT, particlePosition, type Vector3} from "./choreography";
import {clampTime} from "./timeline";

/** Ordered illustrative route through attention and each feed-forward column. */
export function tokenRoute(token: number): readonly Vector3[] {
    const route: Vector3[] = [{x: -990, y: (token - 2) * 38, z: -40}];
    for (let layer = 0; layer < LAYER_COUNT; layer++) {
        const base = 720 + layer * 120;
        for (const node of [(token * 7 + layer * 3) % 60, 60 + token * 3, 80 + (token * 3 + layer) % 20, 100 + (token * 3 + layer * 2) % 20]) {
            route.push(particlePosition(base + node, 0));
        }
    }
    route.push({x: 970, y: (token - 2) * 24, z: 0});
    return route;
}

const routes = Array.from({length: 5}, (_, token) => tokenRoute(token));

/** Tracks a prompt token through a scripted path; only the final stage chooses an output. */
export function tokenJourney(token: number, value: number) {
    const route = routes[token % routes.length];
    const progress = Math.max(0, Math.min(1, (clampTime(value) - 5 - token * 0.65) / 42));
    const step = progress * (route.length - 1);
    const index = Math.min(route.length - 2, Math.floor(step));
    const blend = step - index;
    const from = route[index], to = route[index + 1];
    return {
        progress, from, to,
        position: {x: from.x + (to.x - from.x) * blend, y: from.y + (to.y - from.y) * blend, z: from.z + (to.z - from.z) * blend},
    };
}
