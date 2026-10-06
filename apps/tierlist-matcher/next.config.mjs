import {createAppConfig} from "@oskar-lab/config/next";
const config = createAppConfig("tierlist-matcher");
const tierlistConfig = {...config, env: {...config.env, NEXT_PUBLIC_PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL ?? process.env.AUTH_PLATFORM_URL ?? "http://localhost:10030"}};
export default tierlistConfig;
