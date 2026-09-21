import CoreExplorer from "./CoreExplorer";
import {
    generateComponentDocumentation,
    generateCoreDocumentation,
} from "@/lib/documentation/sourceDocumentation";

export default async function CorePage() {
    const [coreDocumentation, componentDocumentation] = await Promise.all([
        generateCoreDocumentation(),
        generateComponentDocumentation(),
    ]);

    return <CoreExplorer coreDocumentation={coreDocumentation} componentDocumentation={componentDocumentation} />;
}
