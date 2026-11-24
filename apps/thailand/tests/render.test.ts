import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {expect, it, vi} from "vitest";
import Timeline from "../src/app/Timeline";
import styles from "../src/app/Timeline.module.css";
import type {Trip} from "../src/lib/model";

it("renders accessible day anchors, native disclosures and protected document links",async()=>{
    vi.stubGlobal("React",React);
    vi.stubEnv("NEXT_PUBLIC_APP_BASE_PATH","/apps/thailand");
    const trip:Trip={start:"2030-12-20",end:"2031-01-03",updated:"2030-11-01",events:[
        {id:"outbound",date:"2030-12-20",time:"10:00",kind:"flight",title:"Beispielstadt A nach Beispielstadt B",location:"AAA · BBB",subtitle:"Beispiel-Airline · Economy",details:[{label:"Abflug",value:"20.12.2030 · 10:00 · Beispielstadt A · Terminal 1"},{label:"Ankunft",value:"20.12.2030 · 19:20 · Beispielstadt B · Terminal A"},{label:"Reisender",value:"Beispielreisender"}],note:"Umstieg in Beispielstadt B: 2 Std. 40 Min.",documents:["sample"],source:"Beispieldaten für Layoutprüfung"},
        {id:"experience",date:"2030-12-31",time:"20:00",kind:"experience",title:"Silvester auf dem Chao Phraya",location:"BANGKOK",subtitle:"Eine gemeinsame Nacht auf dem Wasser",details:[],source:"Beispieldaten"},
    ],documents:[{id:"sample",title:"Beispiel · E-Ticket",filename:"example.pdf",mime:"application/pdf"}],missing:["Unterkünfte und Transfers noch ergänzen."]};
    const html=renderToStaticMarkup(React.createElement(Timeline, {trip}));
    expect(html).toContain('id="day-2031-01-01"');
    expect(html).toContain('href="/apps/thailand/documents/sample"');
    expect(html).toContain("<summary>Buchungsdetails</summary>");
    if(process.env.THAILAND_VISUAL_HTML){
        const css=(await readFile(path.resolve("apps/thailand/src/app/Timeline.module.css"),"utf8")).replace(/\.([a-zA-Z][\w-]*)/g,(match,name)=>styles[name]?`.${styles[name]}`:match);
        await writeFile(process.env.THAILAND_VISUAL_HTML,`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Thailand · Layoutprüfung mit Beispieldaten</title><style>body{margin:0}button{font:inherit}${css}</style>${html}</html>`);
    }
    vi.unstubAllEnvs();
});
