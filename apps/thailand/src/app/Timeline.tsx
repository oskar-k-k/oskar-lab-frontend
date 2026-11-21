"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Platform links cross independent app boundaries. */
import {useState} from "react";
import {appPath} from "@oskar-lab/config/paths";
import {daysOfTrip, type Trip, type TripEvent} from "../lib/model";
import styles from "./Timeline.module.css";

const labels = {flight:"Flug", stay:"Unterkunft", experience:"Erlebnis", transfer:"Transfer"};
const icons = {flight:"✈", stay:"⌂", experience:"✦", transfer:"⇄"};
const dateLabel = (date: string) => new Intl.DateTimeFormat("de-DE", {day:"numeric", month:"long", timeZone:"UTC"}).format(new Date(date + "T12:00:00Z"));
export default function Timeline({trip}: {trip: Trip}) {
    const [filter, setFilter] = useState("all");
    const days = daysOfTrip(trip);
    const today = new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Bangkok"}).format(new Date());
    const next = days.find(day => day.date >= today && day.events.length)?.date ?? trip.start;
    const filtered = days.filter(day => filter === "all" || day.events.some(event => event.kind === filter));
    return <div className={styles.page}>
        <header className={styles.header}><a href="/">OSKAR LAB <span>/ REISEN</span></a><a href="/account">Privater Bereich <span aria-hidden="true">◈</span></a></header>
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroArt} aria-hidden="true"><div className={styles.sun}/><div className={styles.island}/><div className={styles.water}/></div>
                <div className={styles.heroText}><p className={styles.eyebrow}>ZUSAMMEN UNTERWEGS · 2026 / 27</p><h1>Ein Winter.<br/><em>Ganz viel Thailand.</em></h1><p className={styles.intro}>Von der ersten Landung bis zum letzten Sonnenuntergang. Unsere Reise, Tag für Tag.</p>
                <div className={styles.heroBottom}><span>{dateLabel(trip.start)} – {dateLabel(trip.end)} {trip.end.slice(0,4)}</span><a href={`#day-${next}`} onClick={() => setFilter("all")}>Zur nächsten Station</a></div></div>
            </section>
            <section className={styles.overview} aria-label="Reiseübersicht"><div><strong>{days.length}</strong><span>Reisetage</span></div><div><strong>{trip.events.filter(e=>e.kind==="flight").length}</strong><span>Flugstrecken</span></div><div><strong>{trip.events.filter(e=>e.kind==="experience").length}</strong><span>Erlebnisse</span></div><a href="#documents"><strong>{trip.documents.length}</strong><span>Dokumente</span></a></section>
            <div className={styles.workspace}><aside className={styles.sidebar}><p className={styles.eyebrow}>UNSER REISEPLAN</p><h2>Vorfreude inklusive.</h2><p>Alle Uhrzeiten sind Ortszeiten am jeweiligen Flughafen oder Veranstaltungsort.</p><a href="#open">Was noch fehlt</a><a href="#documents">Tickets & Dokumente</a><div className={styles.sideNote}>Aus Oskars Buchungen zusammengestellt.<br/>Stand: {dateLabel(trip.updated)} {trip.updated.slice(0,4)}.<br/>Keine Live-Flugupdates.</div></aside>
            <section className={styles.timeline} aria-label="Chronologische Reise-Timeline"><div className={styles.timelineHeading}><div><p className={styles.eyebrow}>EIN TAG NACH DEM ANDEREN</p><h2>Unsere Timeline</h2></div><span>DEZ — JAN</span></div>
            <nav className={styles.filters} aria-label="Timeline filtern">{[["all","Alle Tage"],["flight","Flüge"],["stay","Unterkünfte"],["experience","Erlebnisse"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</nav>
            {filtered.length===0 && <div className={styles.empty}><h3>Noch keine Unterkünfte hinterlegt</h3><p>In den verfügbaren E-Mails gibt es noch keine bestätigten Hotels für diese Reise.</p><button onClick={()=>setFilter("all")}>Alle Tage anzeigen</button></div>}
            {filtered.map((day,index)=><section id={`day-${day.date}`} key={day.date} className={`${styles.day} ${day.events.length ? "" : styles.freeDay}`}>
                <div className={styles.date}><span>{new Intl.DateTimeFormat("de-DE",{weekday:"short", timeZone:"UTC"}).format(new Date(day.date+"T12:00:00Z"))}</span><strong>{day.date.slice(8)}</strong><span>{day.date.slice(5,7)==="12"?"DEZ":"JAN"}</span></div>
                <div className={styles.dayContent}><div className={styles.dayTitle}><h3>{dateLabel(day.date)}</h3>{day.date===today?<span>Heute in Thailand</span>:<span>Tag {days.findIndex(d=>d.date===day.date)+1}</span>}</div>
                {day.events.length===0 ? <p className={styles.free}>Zeit für eigene Pläne <span>Keine Buchung hinterlegt</span></p> : day.events.filter(event=>filter==="all"||event.kind===filter).map(event=><Event key={event.id} event={event} trip={trip} first={index===0}/>)}
                </div></section>)}
            </section></div>
            <section id="open" className={styles.open}><p className={styles.eyebrow}>NOCH ZU ERGÄNZEN</p><h2>Ein bisschen Platz für Pläne.</h2><ul>{trip.missing.map(item=><li key={item}>{item}</li>)}</ul></section>
            <section id="documents" className={styles.documents}><p className={styles.eyebrow}>ALLES GRIFFBEREIT</p><h2>Tickets & Dokumente</h2><p>Nur für euch zugänglich. Zum Öffnen ist eine Internetverbindung nötig.</p><div className={styles.documentGrid}>{trip.documents.map(doc=><a key={doc.id} href={appPath(`/documents/${doc.id}`)} target="_blank" rel="noreferrer"><span>{doc.mime==="application/pdf"?"PDF":doc.mime==="image/png"?"BILD":"BELEG"}</span><strong>{doc.title}</strong><span>Öffnen</span></a>)}</div></section>
            <p className={styles.sideNote}>Eure Buchungsdaten und Dokumente werden auf dem OskarLab-Server gespeichert und nur den freigeschalteten Google-Konten angezeigt. Diese App liest kein Postfach aus und speichert keine Reiseunterlagen für die Offline-Nutzung. Änderungen oder Löschung können über den Betreiber angefragt werden.</p>
            <footer className={styles.footer}>Für unsere gemeinsamen Erinnerungen. <a href="#">Zurück nach oben</a></footer>
        </main>
    </div>;
}
function Event({event,trip,first}: {event:TripEvent;trip:Trip;first:boolean}) {
    return <article className={styles.card} data-kind={event.kind}><div className={styles.cardTop}><span className={styles.kind}>{icons[event.kind]} {labels[event.kind]}</span><span>{event.time ?? "Uhrzeit offen"}</span></div><p className={styles.location}>{event.location}</p><h4>{event.title}</h4><p className={styles.subtitle}>{event.subtitle}</p>{event.note && <p className={styles.notice}>{event.note}</p>}<details open={first}><summary>Buchungsdetails</summary><dl>{event.details.map(detail=><div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl><p className={styles.source}>Quelle: {event.source}</p></details>{event.documents && <div className={styles.actions}>{event.documents.map(id=><a key={id} href={appPath(`/documents/${id}`)} target="_blank" rel="noreferrer">{trip.documents.find(d=>d.id===id)?.title ?? "Dokument öffnen"}</a>)}</div>}</article>;
}
