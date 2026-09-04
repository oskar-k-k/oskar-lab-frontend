"use client";

import {useState} from "react";
import Button from "@/components/Buttons/Button";
import Card from "@/components/Cards/Card";
import Grid from "@/components/Grids/Grid";
import Square from "@/components/Grids/SquareView";
import Header from "@/components/Header/Header";
import StandardLayout from "@/components/Layouts/StandardLayout";
import type {SourceDocumentation} from "@/lib/documentation/sourceDocumentation";
import styles from "./CorePage.module.css";

type Tab = "design" | "components" | "core";
const tabs: ReadonlyArray<{id: Tab; label: string; detail: string}> = [
    {id: "design", label: "UI Design", detail: "Tokens & HTML"},
    {id: "components", label: "Components", detail: "React & Next.js"},
    {id: "core", label: "Core Classes", detail: "Auto-Dokumentation"},
];
const colors = ["background", "background-soft", "surface", "surface-elevated", "primary", "accent-purple", "accent-blue", "accent-cyan", "accent-green", "accent-yellow", "accent-orange", "accent-red"];

function DocumentationList({files}: Readonly<{files: readonly SourceDocumentation[]}>) {
    return <div className={styles.documentationGrid}>{files.map(file => (
        <article className={styles.docCard} key={file.path}>
            <code className={styles.source}>{file.path}</code>
            {file.symbols.map(symbol => <section className={styles.symbol} key={`${file.path}-${symbol.name}`}>
                <div className={styles.symbolHeading}><span>{symbol.kind}</span><h3>{symbol.name}</h3></div>
                {symbol.description && <p>{symbol.description}</p>}
                <pre><code>{symbol.signature}</code></pre>
                {symbol.members.length > 0 && <div className={styles.members}>{symbol.members.map(member => (
                    <div key={`${symbol.name}-${member.name}`}><code>{member.signature}</code>{member.description && <p>{member.description}</p>}</div>
                ))}</div>}
            </section>)}
        </article>
    ))}</div>;
}

function DesignTab() {
    return <div className={styles.tabContent}>
        <section className={styles.section}>
            <h2>Farben & Tokens</h2><p className={styles.intro}>Direkt aus <code>src/styles/variables.css</code> gerendert. Änderungen erscheinen hier sofort.</p>
            <div className={styles.colorGrid}>{colors.map(color => <article className={styles.colorCard} key={color}><div className={styles.swatch} style={{background: `var(--color-${color})`}} /><strong>{color}</strong><code>--color-{color}</code></article>)}</div>
        </section>
        <section className={styles.section}>
            <h2>Typografie</h2><div className={styles.typeSpecimen}><h1>Heading One</h1><h2>Heading Two</h2><h3>Heading Three</h3><p>Ein normaler Absatz für längere Inhalte. Gute Lesbarkeit, klare Hierarchie und ruhige Kontraste bilden den Standard.</p><blockquote>„Ein Designsystem macht Entscheidungen sichtbar und wiederholbar.“</blockquote><code>const design = &quot;consistent&quot;;</code></div>
        </section>
        <section className={styles.section}>
            <h2>Formulare</h2><div className={styles.formGrid}>
                <label>Textfeld<input placeholder="Projektname" /></label><label>E-Mail<input type="email" placeholder="name@oskar-lab.de" /></label>
                <label>Auswahl<select defaultValue="design"><option value="design">UI Design</option><option value="core">Core</option></select></label><label>Textarea<textarea rows={4} placeholder="Beschreibung …" /></label>
                <label className={styles.check}><input type="checkbox" defaultChecked /> Feature aktivieren</label><label className={styles.check}><input type="radio" name="demo" defaultChecked /> Standardoption</label>
                <label>Fortschritt<progress value="68" max="100">68 %</progress></label><label>Bereich<input type="range" defaultValue="68" /></label>
            </div>
        </section>
        <section className={styles.section}>
            <h2>Listen, Tabellen & Status</h2><div className={styles.contentGrid}><div className={styles.demoPanel}><h3>Standardliste</h3><ul><li>Projektneutral</li><li>Wiederverwendbar</li><li>Dokumentiert</li></ul></div><div className={styles.demoPanel}><h3>Status</h3><div className={styles.badges}><span>Info</span><span>Erfolg</span><span>Warnung</span><span>Fehler</span></div></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Element</th><th>Status</th><th>Bereich</th></tr></thead><tbody><tr><td>Button</td><td>Stabil</td><td>Components</td></tr><tr><td>Vector</td><td>Getestet</td><td>Core</td></tr><tr><td>Input</td><td>Design-Default</td><td>UI</td></tr></tbody></table></div>
        </section>
    </div>;
}

function ComponentsTab({documentation}: Readonly<{documentation: readonly SourceDocumentation[]}>) {
    return <div className={styles.tabContent}>
        <section className={styles.section}><h2>Live-Komponenten</h2><p className={styles.intro}>Die echten globalen Komponenten, mit sinnvollen Beispiel-Props gerendert.</p>
            <div className={styles.previewGrid}>
                <article className={styles.preview}><h3>Button</h3><div className={styles.demoRow}><Button variant="primary">Primary</Button><Button>Secondary</Button><Button disabled>Disabled</Button></div></article>
                <article className={styles.preview}><h3>Card</h3><Card title="Project Card" description="Globale Vorschaukarte mit Titel und Beschreibung." href="#" /></article>
                <article className={styles.preview}><h3>Grid</h3><Grid cardWidth={70} gap={8}>{[1, 2, 3].map(item => <div className={styles.gridItem} key={item}>{item}</div>)}</Grid></article>
                <article className={styles.preview}><h3>SquareView</h3><div className={styles.squareDemo}><Square color="var(--color-primary)" /><Square color="var(--color-accent-cyan)" /></div></article>
                <article className={`${styles.preview} ${styles.widePreview}`}><h3>Header</h3><div className={styles.componentFrame}><Header projectName="Preview" center={<span>Center Slot</span>} right={<span>Right Slot</span>} /></div></article>
                <article className={`${styles.preview} ${styles.widePreview}`}><h3>StandardLayout</h3><div className={styles.layoutFrame}><StandardLayout maxWidth={560} padding={18}><div className={styles.gridItem}>Zentrierter Inhalt</div></StandardLayout></div></article>
            </div>
        </section>
        <section className={styles.section}><h2>Automatische Component API</h2><p className={styles.intro}>Dateien, Funktionen und Props werden direkt aus <code>src/components</code> gelesen.</p><DocumentationList files={documentation} /></section>
    </div>;
}

export default function CoreExplorer({coreDocumentation, componentDocumentation}: Readonly<{coreDocumentation: readonly SourceDocumentation[]; componentDocumentation: readonly SourceDocumentation[]}>) {
    const [activeTab, setActiveTab] = useState<Tab>("design");
    return <div className={styles.page}>
        <section className={styles.hero}><span className={styles.kicker}>Oskar Lab · Living Documentation</span><h1>Core & Design System</h1><p>Eine automatisch gepflegte Referenz für Design, globale Komponenten und projektübergreifenden Code.</p></section>
        <div className={styles.tabs} role="tablist" aria-label="Dokumentationsbereiche">{tabs.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? styles.activeTab : ""} onClick={() => setActiveTab(tab.id)}><strong>{tab.label}</strong><span>{tab.detail}</span></button>)}</div>
        <main>{activeTab === "design" && <DesignTab />}{activeTab === "components" && <ComponentsTab documentation={componentDocumentation} />}{activeTab === "core" && <div className={styles.tabContent}><section className={styles.section}><h2>Automatische Core API</h2><p className={styles.intro}>Diese Ansicht scannt <code>src/core</code>. JSDoc-Kommentare über Klassen und Methoden erscheinen automatisch als Beschreibung.</p><DocumentationList files={coreDocumentation} /></section></div>}</main>
        <footer className={styles.footer}><strong>Regel:</strong> Wiederverwendbar und projektneutral → Core oder Components. Fachlich speziell → jeweiliges Projekt.</footer>
    </div>;
}
