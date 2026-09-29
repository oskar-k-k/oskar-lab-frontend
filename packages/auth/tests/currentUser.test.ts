import {expect, it, vi} from "vitest";
const session = vi.hoisted(() => ({data: {} as Record<string, unknown>, status: "authenticated"}));
vi.mock("next-auth/react", () => ({useSession: () => session}));
import {useCurrentUser} from "../src/useCurrentUser";

it("tolerates an empty session response instead of crashing the exercise page", () => {
    expect(useCurrentUser()).toEqual({user: null, loading: false, needsOnboarding: false});
});
