import {describe, expect, it} from "vitest";
import {canAccessPrivateProject} from "../src/privateProjects.private";
const canAccessThailand = (session: Parameters<typeof canAccessPrivateProject>[0]) => canAccessPrivateProject(session, ["f1e43d2d1fab87beb9b9d0dce922f8c633cdffd2a8cf94ea6efe691bf34ea4b6"]);
const user = {id:"real-user", provider:"google", complete:true, email:"traveler@example.invalid"};
describe("private project access", () => {
    it.each(["traveler@example.invalid", "TRAVELER@example.invalid"])("accepts the allowed Google account %s", email => {
        expect(canAccessThailand({user:{...user,email}})).toBe(true);
    });
    it.each([undefined, null, {}, {user:{...user,email:"other@example.invalid"}}, {user:{...user,email:"traveler+alias@example.invalid"}}, {user:{...user,provider:"credentials"}}, {user:{...user,complete:false}}, {user:{...user,id:""}}, {user,linkRequired:true}, {user,sessionUnavailable:true}])("denies untrusted or incomplete sessions", session => {
        expect(canAccessThailand(session)).toBe(false);
    });
});
