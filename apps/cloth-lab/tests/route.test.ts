import {afterEach, expect, it, vi} from "vitest";
import {GET, POST} from "../src/app/api/try-on/route";

afterEach(() => {vi.unstubAllGlobals(); vi.unstubAllEnvs();});

it("preserves a configured custom worker endpoint and streams the image", async () => {
    vi.stubEnv("TRYON_WORKER_URL", "http://worker.invalid/custom/generate?mode=clothing");
    const fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {headers: {"content-type": "image/png"}}));
    vi.stubGlobal("fetch", fetcher);
    const form = new FormData();
    form.set("person", new Blob(["person"], {type: "image/png"}), "person.png");
    form.set("garment", new Blob(["garment"], {type: "image/png"}), "garment.png");
    const response = await POST(new Request("http://lab.invalid/api/try-on", {method: "POST", body: form}));
    const upstream = fetcher.mock.calls[0][0] as Request;
    expect(upstream.url).toBe("http://worker.invalid/custom/generate?mode=clothing");
    expect(upstream.method).toBe("POST");
    expect((await upstream.formData()).get("category")).toBe("upper_body");
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(await response.arrayBuffer()).toEqual(new Uint8Array([1, 2, 3]).buffer);
});

it("uses the sibling health endpoint for a standard worker URL", async () => {
    vi.stubEnv("TRYON_WORKER_URL", "http://worker.invalid/prefix/try-on");
    const fetcher = vi.fn().mockResolvedValue(Response.json({status: "ok", engine: "mock"}));
    vi.stubGlobal("fetch", fetcher);
    expect(await (await GET()).json()).toEqual({online: true, configured: true, engine: "mock"});
    expect((fetcher.mock.calls[0][0] as Request).url).toBe("http://worker.invalid/prefix/health");
});
