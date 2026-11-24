vi.mock("@oskar-lab/auth/privateProjects", async importOriginal => {
    const original = await importOriginal<typeof import("@oskar-lab/auth/privateProjects")>();
    return {...original, canAccessThailand: (session: Parameters<typeof original.canAccessThailand>[0]) => original.canAccessPrivateProject(session, ["f1e43d2d1fab87beb9b9d0dce922f8c633cdffd2a8cf94ea6efe691bf34ea4b6"])};
});
import {beforeEach, expect, it, vi} from "vitest";
import React from "react";
const state=vi.hoisted(()=>({auth:vi.fn(),getAll:vi.fn()}));
vi.mock("@oskar-lab/auth/server",()=>({auth:state.auth}));
vi.mock("@/lib/api/apps",()=>({appsApi:{getAll:state.getAll}}));
vi.mock("../src/app/AppsExplorer",()=>({default:()=>null}));
import Home from "../src/app/page";
beforeEach(()=>{vi.stubGlobal("React",React);state.auth.mockReset();state.getAll.mockResolvedValue({content:[{id:99,path:"thailand",title:"Must not leak"}]});});
it("does not serialize the private entry for anonymous or other users, even if the backend returns it",async()=>{
    for(const session of [null,{user:{id:"u",complete:true,provider:"google",email:"other@gmail.com"}}]){
        state.auth.mockResolvedValue(session);
        const page=await Home();
        expect([...page.props.localApps, ...page.props.initialRemoteApps].some((app:{path:string})=>app.path==="thailand")).toBe(false);
    }
});
it("shows the private entry once to an allowed Google account",async()=>{
    state.auth.mockResolvedValue({user:{id:"u",complete:true,provider:"google",email:"traveler@example.invalid"}});
    const page=await Home();
    expect([...page.props.localApps, ...page.props.initialRemoteApps].filter((app:{path:string})=>app.path==="thailand")).toHaveLength(1);
});
