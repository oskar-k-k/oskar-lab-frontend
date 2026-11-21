import {createAppConfig} from "@oskar-lab/config/next";
const config = {...createAppConfig("thailand"),
    outputFileTracingExcludes: {"/*": ["./private-data/**/*"]},
    async headers() {return [{source:"/:path*", headers:[
    {key:"Cache-Control", value:"private, no-store, max-age=0"},
    {key:"X-Robots-Tag", value:"noindex, noarchive, nosnippet"},
    {key:"Referrer-Policy", value:"no-referrer"},
    {key:"X-Content-Type-Options", value:"nosniff"},
]}];}};
export default config;
