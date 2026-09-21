"use client";

import {useMemo, useState} from "react";
import RangeSlider from "@oskar-lab/ui/RangeSlider/RangeSlider";
import Tabs from "@oskar-lab/ui/Tabs/Tabs";
import Button from "@oskar-lab/ui/Buttons/Button";
import Card from "@oskar-lab/ui/Cards/Card";
import Grid from "@oskar-lab/ui/Grids/Grid";
import Square from "@oskar-lab/ui/Grids/SquareView";
import Header from "@oskar-lab/platform-shell/Header/Header";
import StandardLayout from "@oskar-lab/ui/Layouts/StandardLayout";
import Search from "@oskar-lab/ui/Search/Search";
import LanguageSwitch from "@oskar-lab/ui/LanguageSwitch/LanguageSwitch";
import type {SourceDocumentation} from "@/lib/documentation/sourceDocumentation";
import {countDocumentedSymbols, filterDocumentation, filterReferences, type SearchReference} from "./searchDocumentation";
import styles from "./CorePage.module.css";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import type {TranslationKey} from "@oskar-lab/i18n/messages";

type Tab = "design" | "components" | "core";
type Translate = (key: TranslationKey, variables?: Readonly<Record<string, string | number>>) => string;
const colors = ["background", "background-soft", "surface", "surface-elevated", "primary", "accent-purple", "accent-blue", "accent-cyan", "accent-green", "accent-yellow", "accent-orange", "accent-red"];
type DesignReference = SearchReference & Readonly<{token?: string}>;
type ComponentReference = SearchReference & Readonly<{wide?: boolean}>;
function createDesignReferences(t: Translate): readonly DesignReference[] { return [
    ...colors.map(color => ({id: `color-${color}`, title: color, description: t("core.globalColor", {token: `--color-${color}`}), keywords: ["farbe", "color", "token", "css", ...(color.startsWith("background") ? ["hintergrund"] : [])], token: color})),
    {id: "range-slider", title: "RangeSlider", description: t("core.rangeSliderDescription"), keywords: ["range", "slider", "min", "max"]},
    {id: "tabs", title: "Tabs", description: t("core.tabsDescription"), keywords: ["tabs", "navigation", "content"]},
    {id: "typography", title: t("core.typography"), description: t("core.typographyDescription"), keywords: ["text", "schrift", "heading", "typography", "typografie"]},
    {id: "forms", title: t("core.forms"), description: t("core.formsDescription"), keywords: ["input", "form", "formular", "select", "textfield"]},
    {id: "structured-content", title: t("core.listsTablesStatus"), description: t("core.structuredContentDescription"), keywords: ["table", "tabelle", "list", "liste", "badge", "status"]},
]; }
function createComponentReferences(t: Translate): readonly ComponentReference[] { return [
    {id: "range-slider", title: "RangeSlider", description: t("core.rangeSliderDescription"), keywords: ["range", "slider", "min", "max"]},
    {id: "tabs", title: "Tabs", description: t("core.tabsDescription"), keywords: ["tabs", "navigation", "content"], wide: true},
    {id: "button", title: "Button", description: t("core.primaryActions"), keywords: ["buttons", "knopf", "aktion"]},
    {id: "card", title: "Card", description: t("core.contentCards"), keywords: ["cards", "karte", "project"]},
    {id: "grid", title: "Grid", description: t("core.responsiveGrid"), keywords: ["grids", "raster", "layout"]},
    {id: "square", title: "SquareView", description: t("core.squareCell"), keywords: ["square", "quadrat", "cell"]},
    {id: "search", title: "Search", description: t("core.controlledSearch"), keywords: ["suche", "searchbar", "input"]},
    {id: "language", title: "LanguageSwitch", description: t("core.languageSwitchDescription"), keywords: ["language", "locale", "sprache", "übersetzung", "translation"]},
    {id: "header", title: "Header", description: t("core.globalHeader"), keywords: ["navigation", "kopfzeile"], wide: true},
    {id: "layout", title: "StandardLayout", description: t("core.standardLayout"), keywords: ["layout", "seite", "container"], wide: true},
]; }

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

function RangePreview() {
    const {t} = useI18n();
    const [value, setValue] = useState<[number, number]>([3, 8]);
    return <RangeSlider label={t("core.range")} minLabel={t("common.minimum")} maxLabel={t("common.maximum")}
        min={1} max={20} value={value} onChange={setValue} />;
}

function TabsPreview() {
    const {t} = useI18n();
    return <Tabs label={t("core.tabsLabel")} items={[
        {id: "overview", label: t("core.tabDesign"), content: <p>{t("core.tabsDescription")}</p>},
        {id: "details", label: t("core.tabComponents"), content: <p>{t("core.liveComponentsDescription")}</p>},
    ]} />;
}

function DesignTab() {
    const {t} = useI18n();
    return <div className={styles.tabContent}>
        <section className={styles.section}><h2>RangeSlider</h2><RangePreview /></section>
        <section className={styles.section}><h2>Tabs</h2><TabsPreview /></section>
        <section className={styles.section}>
            <h2>{t("core.colors")}</h2><p className={styles.intro}>{t("core.colorsDescription")}</p>
            <div className={styles.colorGrid}>{colors.map(color => <article className={styles.colorCard} key={color}><div className={styles.swatch} style={{background: `var(--color-${color})`}} /><strong>{color}</strong><code>--color-{color}</code></article>)}</div>
        </section>
        <section className={styles.section}>
            <h2>{t("core.typography")}</h2><div className={styles.typeSpecimen}><h1>Heading One</h1><h2>Heading Two</h2><h3>Heading Three</h3><p>{t("core.typographyDescription")}</p><blockquote>“{t("core.quote")}”</blockquote><code>const design = &quot;consistent&quot;;</code></div>
        </section>
        <section className={styles.section}>
            <h2>{t("core.forms")}</h2><div className={styles.formGrid}>
                <label>{t("core.textField")}<input placeholder={t("core.appName")} /></label><label>E-Mail<input type="email" placeholder="name@oskar-lab.de" /></label>
                <label>{t("core.selection")}<select defaultValue="design"><option value="design">UI Design</option><option value="core">Core</option></select></label><label>Textarea<textarea rows={4} placeholder={t("core.description")} /></label>
                <label className={styles.check}><input type="checkbox" defaultChecked /> {t("core.enableFeature")}</label><label className={styles.check}><input type="radio" name="demo" defaultChecked /> {t("core.defaultOption")}</label>
                <label>{t("core.progress")}<progress value="68" max="100">68 %</progress></label><label>{t("core.range")}<input type="range" defaultValue="68" /></label>
            </div>
        </section>
        <section className={styles.section}>
            <h2>{t("core.listsTablesStatus")}</h2><div className={styles.contentGrid}><div className={styles.demoPanel}><h3>{t("core.standardList")}</h3><ul><li>{t("core.projectNeutral")}</li><li>{t("core.reusable")}</li><li>{t("core.documented")}</li></ul></div><div className={styles.demoPanel}><h3>{t("core.status")}</h3><div className={styles.badges}><span>{t("core.info")}</span><span>{t("core.success")}</span><span>{t("core.warning")}</span><span>{t("core.error")}</span></div></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>{t("core.element")}</th><th>{t("core.status")}</th><th>{t("core.area")}</th></tr></thead><tbody><tr><td>Button</td><td>{t("core.stable")}</td><td>Components</td></tr><tr><td>Vector</td><td>{t("core.tested")}</td><td>Core</td></tr><tr><td>Input</td><td>{t("core.designDefault")}</td><td>UI</td></tr></tbody></table></div>
        </section>
    </div>;
}

function ComponentGallery({references}: Readonly<{references: readonly ComponentReference[]}>) {
    const [previewQuery, setPreviewQuery] = useState("");
    const {t} = useI18n();
    return <div className={styles.previewGrid}>{references.map(reference => <article className={`${styles.preview} ${reference.wide ? styles.widePreview : ""}`} key={reference.id}><h3>{reference.title}</h3>
        {reference.id === "range-slider" && <RangePreview />}
        {reference.id === "tabs" && <TabsPreview />}
        {reference.id === "button" && <div className={styles.demoRow}><Button variant="primary">Primary</Button><Button>Secondary</Button><Button disabled>Disabled</Button></div>}
        {reference.id === "card" && <Card title="Project Card" description={t("core.previewCardDescription")} />}
        {reference.id === "grid" && <Grid cardWidth={70} gap={8}>{[1, 2, 3].map(item => <div className={styles.gridItem} key={item}>{item}</div>)}</Grid>}
        {reference.id === "square" && <div className={styles.squareDemo}><Square color="var(--color-primary)" /><Square color="var(--color-accent-cyan)" /></div>}
        {reference.id === "search" && <Search value={previewQuery} onChange={setPreviewQuery} label={t("core.previewSearch")} placeholder={`${t("core.previewSearch")} …`} />}
        {reference.id === "language" && <LanguageSwitch />}
        {reference.id === "header" && <div className={styles.componentFrame}><Header appName="Preview" center={<span>Center Slot</span>} right={<span>Right Slot</span>} /></div>}
        {reference.id === "layout" && <div className={styles.layoutFrame}><StandardLayout maxWidth={560} padding={18}><div className={styles.gridItem}>{t("core.centeredContent")}</div></StandardLayout></div>}
    </article>)}</div>;
}

function ComponentsTab({documentation}: Readonly<{documentation: readonly SourceDocumentation[]}>) {
    const {t} = useI18n();
    const componentReferences = createComponentReferences(t);
    return <div className={styles.tabContent}>
        <section className={styles.section}><h2>{t("core.liveComponents")}</h2><p className={styles.intro}>{t("core.liveComponentsDescription")}</p>
            <ComponentGallery references={componentReferences} />
        </section>
        <section className={styles.section}><h2>{t("core.automaticComponentApi")}</h2><p className={styles.intro}>{t("core.automaticComponentApiDescription")}</p><DocumentationList files={documentation} /></section>
    </div>;
}

export default function CoreExplorer({coreDocumentation, componentDocumentation}: Readonly<{coreDocumentation: readonly SourceDocumentation[]; componentDocumentation: readonly SourceDocumentation[]}>) {
    const [activeTab, setActiveTab] = useState<Tab>("design");
    const [query, setQuery] = useState("");
    const {t} = useI18n();
    const tabs: ReadonlyArray<{id: Tab; label: string; detail: string}> = [
        {id: "design", label: t("core.tabDesign"), detail: t("core.tabDesignDetail")},
        {id: "components", label: t("core.tabComponents"), detail: t("core.tabComponentsDetail")},
        {id: "core", label: t("core.tabCore"), detail: t("core.tabCoreDetail")},
    ];
    const searchResults = useMemo(() => {
        const designReferences = createDesignReferences(t);
        const componentReferences = createComponentReferences(t);
        const design = filterReferences(designReferences, query);
        const componentPreviews = filterReferences(componentReferences, query);
        const components = filterDocumentation(componentDocumentation, query);
        const core = filterDocumentation(coreDocumentation, query);
        return {design, componentPreviews, components, core, count: design.length + componentPreviews.length + countDocumentedSymbols(components) + countDocumentedSymbols(core)};
    }, [componentDocumentation, coreDocumentation, query, t]);

    function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const nextTab = tabs[(index + offset + tabs.length) % tabs.length];
        setActiveTab(nextTab.id);
        document.getElementById(`core-tab-${nextTab.id}`)?.focus();
    }

    const isSearching = query.trim().length > 0;

    return <>
        <Header appName="Core & Design" center={<Search value={query} onChange={setQuery} resultCount={searchResults.count} label={t("core.searchLabel")} placeholder={t("core.searchPlaceholder")} />} />
        <StandardLayout><div className={styles.page}>
        <section className={styles.hero}><span className={styles.kicker}>{t("core.heroKicker")}</span><h1>{t("core.heroTitle")}</h1><p>{t("core.heroDescription")}</p></section>
        <div className={styles.tabs} role="tablist" aria-label={t("core.tabsLabel")}>{tabs.map((tab, index) => <button id={`core-tab-${tab.id}`} key={tab.id} type="button" role="tab" aria-controls={`core-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} className={activeTab === tab.id ? styles.activeTab : ""} onClick={() => setActiveTab(tab.id)} onKeyDown={event => handleTabKeyDown(event, index)}><strong>{tab.label}</strong><span>{tab.detail}</span></button>)}</div>
        {isSearching ? <main className={styles.searchResults} aria-label={t("core.searchResults")}><section className={styles.section}><h2>{t("core.matchesFor", {count: searchResults.count, query: query.trim()})}</h2>
            {searchResults.count === 0 && <div className={styles.noResults}><p>{t("core.noMatches")}</p><Button onClick={() => setQuery("")}>{t("common.clearSearch")}</Button></div>}
            {searchResults.design.length > 0 && <div className={styles.resultGroup}><h3>{t("core.uiDesign")}</h3><div className={styles.designResults}>{searchResults.design.map(reference => <article key={reference.id}>{reference.token && <div className={styles.resultSwatch} style={{background: `var(--color-${reference.token})`}} />}<strong>{reference.title}</strong><p>{reference.description}</p></article>)}</div></div>}
            {searchResults.componentPreviews.length > 0 && <div className={styles.resultGroup}><h3>{t("core.liveComponents")}</h3><ComponentGallery references={searchResults.componentPreviews} /></div>}
            {searchResults.components.length > 0 && <div className={styles.resultGroup}><h3>{t("core.components")}</h3><DocumentationList files={searchResults.components} /></div>}
            {searchResults.core.length > 0 && <div className={styles.resultGroup}><h3>{t("core.coreClasses")}</h3><DocumentationList files={searchResults.core} /></div>}
        </section></main> : <main id={`core-panel-${activeTab}`} role="tabpanel" aria-labelledby={`core-tab-${activeTab}`}>{activeTab === "design" && <DesignTab />}{activeTab === "components" && <ComponentsTab documentation={componentDocumentation} />}{activeTab === "core" && <div className={styles.tabContent}><section className={styles.section}><h2>{t("core.automaticCoreApi")}</h2><p className={styles.intro}>{t("core.automaticCoreApiDescription")}</p><DocumentationList files={coreDocumentation} /></section></div>}</main>}
        <footer className={styles.footer}><strong>{t("core.ruleLabel")}</strong> {t("core.rule")}</footer>
        </div></StandardLayout>
    </>;
}
