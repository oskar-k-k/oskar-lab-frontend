import {createAppConfig} from "@oskar-lab/config/next";
const config = {
    ...createAppConfig("oskar-lab"),
    async headers() {
        return ["/impressum", "/privacy", "/terms", "/modern-reading/privacy"].map(source => ({source, headers: [
            {key: "X-Robots-Tag", value: "noindex, noarchive, nosnippet"},
            {key: "Referrer-Policy", value: "no-referrer"},
            {key: "X-Content-Type-Options", value: "nosniff"},
        ]}));
    },
};
export default config;
