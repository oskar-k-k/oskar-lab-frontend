import Button from "@/components/Buttons/Button";
import Card from "@/components/Cards/Card";
import Grid from "@/components/Grids/Grid";
import styles from "./CorePage.module.css";

const colors = [
    ["Background", "--color-background"],
    ["Background soft", "--color-background-soft"],
    ["Surface", "--color-surface"],
    ["Surface elevated", "--color-surface-elevated"],
    ["Primary", "--color-primary"],
    ["Purple", "--color-accent-purple"],
    ["Blue", "--color-accent-blue"],
    ["Cyan", "--color-accent-cyan"],
    ["Green", "--color-accent-green"],
    ["Yellow", "--color-accent-yellow"],
    ["Orange", "--color-accent-orange"],
    ["Red", "--color-accent-red"],
] as const;

const coreModules = [
    {
        name: "Vector",
        path: "src/core/Vector.ts",
        description: "Immutable 2D-Koordinaten und Vektorberechnungen.",
        api: ["add", "subtract", "multiply", "divide", "equals", "normalize", "toJSON"],
        code: "const target = vec(2, 3).add({x: 1, y: -1});\n// Vector {x: 3, y: 2}",
    },
    {
        name: "VectorLike",
        path: "src/core/Vector.ts",
        description: "Serialisierbare Position aus einfachem x und y – ideal für APIs und WebSockets.",
        api: ["x", "y", "Readonly"],
        code: "const position: VectorLike = {x: 4, y: 6};\nJSON.stringify(position);",
    },
    {
        name: "Array2D<T>",
        path: "src/core/Array2D.ts",
        description: "Typisiertes zweidimensionales Raster mit sicheren Bereichsprüfungen.",
        api: ["create", "createFill", "get", "tryGet", "set", "map", "forEach"],
        code: "const grid = Array2D.create(8, 8, pos => ({pos}));\nconst field = grid.get({x: 3, y: 4});",
    },
] as const;

function SectionHeader({eyebrow, title, description, source}: Readonly<{
    eyebrow: string;
    title: string;
    description: string;
    source: string;
}>) {
    return (
        <header className={styles.sectionHeader}>
            <div>
                <span className={styles.eyebrow}>{eyebrow}</span>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
            <code className={styles.source}>{source}</code>
        </header>
    );
}

export default function CorePage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <span className={styles.kicker}>Oskar Lab · Developer Reference</span>
                <h1>Core & Design System</h1>
                <p>
                    Die zentrale Übersicht über alles, was projektübergreifend verwendet werden kann.
                    Was du hier änderst, soll bewusst das gesamte Oskar Lab prägen.
                </p>
                <nav className={styles.navigation} aria-label="Bereiche dieser Seite">
                    <a href="#foundations">Foundations</a>
                    <a href="#components">Komponenten</a>
                    <a href="#layout">Layout</a>
                    <a href="#core">Core APIs</a>
                </nav>
            </section>

            <section id="foundations" className={styles.section}>
                <SectionHeader
                    eyebrow="01 · Foundations"
                    title="Farben & Design-Tokens"
                    description="Die globale visuelle Sprache. Alle Projekte können diese CSS-Variablen nutzen und lokal erweitern."
                    source="src/styles/variables.css"
                />
                <div className={styles.colorGrid}>
                    {colors.map(([label, variable]) => (
                        <article className={styles.colorCard} key={variable}>
                            <div className={styles.swatch} style={{background: `var(${variable})`}} />
                            <strong>{label}</strong>
                            <code>{variable}</code>
                        </article>
                    ))}
                </div>

                <div className={styles.typeSpecimen}>
                    <span className={styles.eyebrow}>Typografie · Geist</span>
                    <h1>Überschrift H1</h1>
                    <h2>Überschrift H2</h2>
                    <h3>Überschrift H3</h3>
                    <p>Fließtext erklärt Inhalte ruhig und gut lesbar. Gedämpfter Text ergänzt Details, ohne mit dem Hauptinhalt zu konkurrieren.</p>
                    <small>Kleine Zusatzinformation · 14 px</small>
                </div>
            </section>

            <section id="components" className={styles.section}>
                <SectionHeader
                    eyebrow="02 · Components"
                    title="Buttons"
                    description="Globale Aktionen und Links mit einheitlichen Zuständen."
                    source="src/components/Buttons"
                />
                <div className={styles.demoPanel}>
                    <div className={styles.demoRow}>
                        <Button variant="primary">Primary Action</Button>
                        <Button variant="secondary">Secondary Action</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                        <Button href="#core">Button als Link</Button>
                    </div>
                    <p className={styles.hint}>Mit Tab fokussieren, um den globalen Tastatur-Fokus zu prüfen.</p>
                </div>

                <SectionHeader
                    eyebrow="Komponente"
                    title="Cards"
                    description="Klickbare Vorschauen für Projekte und Inhalte."
                    source="src/components/Cards/Card.tsx"
                />
                <div className={styles.cardDemo}>
                    <Card title="Standard Card" description="Eine einfache globale Karte ohne projektspezifische Logik." href="#components" />
                </div>
            </section>

            <section id="layout" className={styles.section}>
                <SectionHeader
                    eyebrow="03 · Layout"
                    title="Raster & Seitenrahmen"
                    description="StandardLayout begrenzt die Inhaltsbreite; Grid verteilt Karten automatisch responsiv."
                    source="src/components/Layouts · src/components/Grids"
                />
                <Grid cardWidth={180} gap={12}>
                    {["Grid Item 01", "Grid Item 02", "Grid Item 03", "Grid Item 04"].map(item => (
                        <div className={styles.gridItem} key={item}>{item}</div>
                    ))}
                </Grid>
                <div className={styles.rules}>
                    <div><strong>Maximale Breite</strong><span>1400 px</span></div>
                    <div><strong>Standard-Padding</strong><span>32 px</span></div>
                    <div><strong>Grid-Gap</strong><span>24 px</span></div>
                    <div><strong>Mobile Breakpoint</strong><span>600 / 768 px</span></div>
                </div>
            </section>

            <section id="core" className={styles.section}>
                <SectionHeader
                    eyebrow="04 · Core"
                    title="Projektübergreifende APIs"
                    description="Framework-unabhängige Bausteine. Sie dürfen weder React noch einzelne Projekte kennen."
                    source="src/core"
                />
                <div className={styles.moduleGrid}>
                    {coreModules.map(module => (
                        <article className={styles.moduleCard} key={module.name}>
                            <div className={styles.moduleHeading}>
                                <h3>{module.name}</h3>
                                <code>{module.path}</code>
                            </div>
                            <p>{module.description}</p>
                            <div className={styles.tags}>
                                {module.api.map(item => <code key={item}>{item}</code>)}
                            </div>
                            <pre><code>{module.code}</code></pre>
                        </article>
                    ))}
                </div>
            </section>

            <footer className={styles.footer}>
                <strong>Faustregel</strong>
                <p>Wiederverwendbar und projektneutral → Core oder Components. Fachlich speziell → in das jeweilige Projekt.</p>
            </footer>
        </div>
    );
}
