import {expect,it,vi} from "vitest";
import path from "node:path";
vi.mock("server-only",()=>({}));
import {generateCoreDocumentation} from "./sourceDocumentation";
it("excludes private access policies from the public reference",async()=>{
    const cwd=vi.spyOn(process,"cwd").mockReturnValue(path.resolve("apps/core-design"));
    try {
        const docs=await generateCoreDocumentation();
        expect(docs.length).toBeGreaterThan(0);
        expect(JSON.stringify(docs)).not.toMatch(/canAccessThailand|privateProjects|canAccessPrivateProject/);
    } finally {cwd.mockRestore();}
});
