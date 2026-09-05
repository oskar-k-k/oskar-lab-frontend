"use client";

import Image from "next/image";
import Link from "next/link";
import {useI18n} from "@/lib/i18n/I18nProvider";
import styles from "./PortfolioPage.module.css";

const experience = [
    {period: "2023—2025", company: "Deine Tierwelt GmbH", role: "portfolio.roleFullStack", text: "portfolio.expTierwelt"},
    {period: "2023—2024", company: "Host-On Service Provider GmbH", role: "portfolio.rolePartner", text: "portfolio.expHostOn"},
    {period: "2022—2023", company: "NetConcept GmbH", role: "portfolio.roleFullStack", text: "portfolio.expNetConcept"},
    {period: "2017—2020", company: "visoma gmbh", role: "portfolio.roleTraining", text: "portfolio.expVisoma"},
] as const;
const skills = ["TypeScript", "JavaScript", "PHP", "C++", "React", "Next.js", "Vue", "Laravel", "Node.js", "SQL", "jQuery", "Unreal Engine", "Qt", "Blender", "Photoshop", "Python", "Git"];
const disciplines = [
    {number: "01", title: "portfolio.webTitle", period: "portfolio.webPeriod", text: "portfolio.webText", highlight: "portfolio.webHighlight", tags: ["PHP", "Laravel", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "SQL", "Git"]},
    {number: "02", title: "portfolio.gameDevTitle", period: "portfolio.gameDevPeriod", text: "portfolio.gameDevText", highlight: "portfolio.gameDevHighlight", tags: ["Unreal Engine 4", "C++", "Blueprints", "Procedural Worlds", "Blender", "Photoshop"]},
    {number: "03", title: "portfolio.aiTitle", period: "portfolio.aiPeriod", text: "portfolio.aiText", highlight: "portfolio.aiHighlight", tags: ["C++", "Qt", "Neural Networks", "Image Classification", "Computer Vision"]},
] as const;

export default function PortfolioPage() {
    const {t} = useI18n();

    return <main className={styles.page}>
        <section className={styles.hero}>
            <div className={styles.ambient} aria-hidden="true" />
            <div className={styles.portraitWrap}><div className={styles.orbit} aria-hidden="true" /><Image className={styles.portrait} src="/projects/portfolio/oskar.jpg" alt="Oskar Konczarek" width={520} height={650} priority /></div>
            <p className={styles.eyebrow}>{t("portfolio.eyebrow")}</p>
            <h1>Oskar<br/><span>Konczarek</span></h1>
            <p className={styles.intro}>{t("portfolio.intro")}</p>
            <div className={styles.actions}><a className={styles.primaryAction} href="#work">{t("portfolio.explore")} ↓</a><a className={styles.secondaryAction} href="mailto:o.konczarek@gmail.com">{t("portfolio.contact")}</a></div>
            <div className={styles.availability}><span />{t("portfolio.openWork")}</div>
        </section>

        <section className={styles.about}>
            <div><p className={styles.sectionLabel}>01 · {t("portfolio.aboutLabel")}</p><h2>{t("portfolio.aboutTitle")}</h2></div>
            <div className={styles.aboutCopy}><p>{t("portfolio.aboutTextOne")}</p><p>{t("portfolio.aboutTextTwo")}</p></div>
            <div className={styles.stats}><article><span>{t("portfolio.codeSince")}</span><strong>{t("portfolio.codeSinceValue")}</strong></article><article><span>{t("portfolio.focus")}</span><strong>{t("portfolio.focusValue")}</strong></article><article><span>{t("portfolio.mode")}</span><strong>{t("portfolio.modeValue")}</strong></article></div>
        </section>

        <section className={styles.disciplines}>
            <header><p className={styles.sectionLabel}>02 · {t("portfolio.disciplinesLabel")}</p><h2>{t("portfolio.disciplinesTitle")}</h2><p>{t("portfolio.disciplinesIntro")}</p></header>
            <div className={styles.disciplineGrid}>{disciplines.map(item => <article key={item.number}>
                <div className={styles.disciplineTop}><span>{item.number}</span><strong>{t(item.period)}</strong></div>
                <h3>{t(item.title)}</h3><p>{t(item.text)}</p>
                <div className={styles.disciplineTags}>{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <div className={styles.disciplineHighlight}><span aria-hidden="true">↳</span>{t(item.highlight)}</div>
            </article>)}</div>
        </section>

        <section className={styles.experience}>
            <header><p className={styles.sectionLabel}>03 · {t("portfolio.experienceLabel")}</p><h2>{t("portfolio.experienceTitle")}</h2><p>{t("portfolio.experienceIntro")}</p></header>
            <div className={styles.timeline}>{experience.map(item => <article key={item.company}><span className={styles.period}>{item.period}</span><div><h3>{item.company}</h3><strong>{t(item.role)}</strong><p>{t(item.text)}</p></div></article>)}</div>
        </section>

        <section className={styles.work} id="work">
            <p className={styles.sectionLabel}>04 · {t("portfolio.projectsLabel")}</p><h2>{t("portfolio.projectsTitle")}</h2>
            <div className={styles.projectGrid}>
                <article className={styles.featuredProject}><span>Platform · 2026</span><h3>{t("portfolio.oskarLabTitle")}</h3><p>{t("portfolio.oskarLabText")}</p><Link href="/">{t("portfolio.viewProject")} ↗</Link><div className={styles.projectGlow} /></article>
                <article><span>TypeScript · React</span><h3>{t("portfolio.chessTitle")}</h3><p>{t("portfolio.chessText")}</p><Link href="/projects/chess">{t("portfolio.viewProject")} ↗</Link></article>
                <article><span>{t("portfolio.fiveYearsUe4")}</span><h3>{t("portfolio.gameTitle")}</h3><p>{t("portfolio.gameText")}</p></article>
            </div>
        </section>

        <section className={styles.toolbox}><div><p className={styles.sectionLabel}>05 · {t("portfolio.stackLabel")}</p><h2>{t("portfolio.stackTitle")}</h2><p>{t("portfolio.stackText")}</p></div><div className={styles.skills}>{skills.map(skill => <span key={skill}>{skill}</span>)}</div></section>

        <section className={styles.mindset}><p className={styles.sectionLabel}>06 · {t("portfolio.mindsetLabel")}</p><blockquote>{t("portfolio.mindsetTitle")}</blockquote><p>{t("portfolio.mindsetText")}</p></section>

        <footer className={styles.footer}><p className={styles.sectionLabel}>07 · {t("portfolio.contactLabel")}</p><h2>{t("portfolio.footerTitle")}</h2><p>{t("portfolio.footerText")}</p><a href="mailto:o.konczarek@gmail.com">{t("portfolio.email")} <span>↗</span></a><small>© {new Date().getFullYear()} Oskar Konczarek</small></footer>
    </main>;
}
