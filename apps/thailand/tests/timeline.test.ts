import {describe, expect, it} from "vitest";
import {daysOfTrip, type Trip} from "../src/lib/model";
describe("calendar timeline",()=>{
    it("includes empty days and sorts departures across the new year",()=>{
        const trip={start:"2026-12-31",end:"2027-01-02",events:[{id:"late",date:"2026-12-31",time:"21:00"},{id:"early",date:"2026-12-31",time:"20:00"},{id:"return",date:"2027-01-01",time:"01:00"}]} as Trip;
        const days=daysOfTrip(trip);
        expect(days.map(d=>d.date)).toEqual(["2026-12-31","2027-01-01","2027-01-02"]);
        expect(days[0].events.map(e=>e.id)).toEqual(["early","late"]);
        expect(days[2].events).toEqual([]);
    });
});
