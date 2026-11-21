vi.mock("@oskar-lab/auth/privateProjects", async importOriginal => {
    const original = await importOriginal<typeof import("@oskar-lab/auth/privateProjects")>();
    return {...original, canAccessThailand: (session: Parameters<typeof original.canAccessThailand>[0]) => original.canAccessPrivateProject(session, ["f1e43d2d1fab87beb9b9d0dce922f8c633cdffd2a8cf94ea6efe691bf34ea4b6"])};
});
import {beforeEach, describe, expect, it, vi} from "vitest";
const state = vi.hoisted(()=>({user:vi.fn(), read:vi.fn()}));
vi.mock("server-only", ()=>({}));
vi.mock("@oskar-lab/auth/platformUser", ()=>({getCurrentUser:state.user}));
vi.mock("node:fs/promises", ()=>({readFile:state.read}));
vi.mock("next/navigation", ()=>({notFound:()=>{throw new Error("404");}}));
import {readTrip} from "../src/lib/data";
import {GET} from "../src/app/documents/[id]/route";
import {GET as cover} from "../src/app/cover/route";
import Page from "../src/app/page";
const allowed = {id:"u",provider:"google",email:"traveler@example.invalid"};
const document = {id:"ticket", filename:"ticket.pdf",mime:"application/pdf",title:"Private"};
beforeEach(()=>{state.user.mockReset();state.read.mockReset();});
describe("private data boundary", ()=>{
    it.each([null,{...allowed,email:"someone@gmail.com"},{...allowed,provider:"credentials"}])("never reads private files for a denied identity", async user=>{
        state.user.mockResolvedValue(user);
        expect(await readTrip()).toBeNull();
        await expect(Page()).rejects.toThrow("404");
        const response=await GET(new Request("http://localhost/documents/ticket"),{params:Promise.resolve({id:"ticket"})});
        expect(response.status).toBe(404);
        expect(response.headers.get("cache-control")).toContain("no-store");
        expect(await response.text()).toBe("");
        expect((await cover()).status).toBe(404);
        expect(state.read).not.toHaveBeenCalled();
    });
    it("fails closed when the account service is unavailable", async()=>{
        state.user.mockRejectedValue(new Error("outage"));
        expect(await readTrip()).toBeNull();
        expect(state.read).not.toHaveBeenCalled();
    });
    it("serves a document only after authorization and without cacheable headers",async()=>{
        state.user.mockResolvedValue(allowed);
        state.read.mockResolvedValueOnce(JSON.stringify({documents:[document]})).mockResolvedValueOnce(Buffer.from("%PDF-private"));
        const response=await GET(new Request("http://localhost/documents/ticket"),{params:Promise.resolve({id:"ticket"})});
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toContain("private, no-store");
        expect(response.headers.get("content-type")).toBe("application/pdf");
        expect(await response.text()).toBe("%PDF-private");
    });
    it("does not turn arbitrary IDs into file paths",async()=>{
        state.user.mockResolvedValue(allowed);
        state.read.mockResolvedValue(JSON.stringify({documents:[document]}));
        expect((await GET(new Request("http://localhost"),{params:Promise.resolve({id:"../../.env"})})).status).toBe(404);
        expect(state.read).toHaveBeenCalledTimes(1);
    });
});
