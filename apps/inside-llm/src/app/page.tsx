import Film from "../components/Film";

/** Opens the local, scripted language-model film. */
export default function Page() { return <Film platformUrl={process.env.AUTH_PLATFORM_URL ?? "http://localhost:10030"} />; }
