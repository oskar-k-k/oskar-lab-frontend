import { expect, it } from "vitest";
import { editStationTime } from "../src/model/edit-time";
import type { Entry } from "../src/app/TravelWorkspace";
const start = {role:"CHECK_IN",date:"2030-12-01",time:"14:00:00",timeMeaning:"NOT_BEFORE",timeZone:"Asia/Bangkok",utcOffset:"+07:00",timelineTime:"17:00:00",timelineUtcOffset:"+07:00",placeName:"Example",address:"Example address",mapEmbedUrl:null} as Entry["points"][number];
const end = {...start,role:"CHECK_OUT",date:"2030-12-03",time:"11:00:00",timeMeaning:"NOT_AFTER"} as Entry["points"][number];
const entry = {id:"example",type:"HOTEL",title:"Example stay",notes:"Keep notes",reference:"Keep reference",bookingSource:"Booking.com",version:4,points:[start,end]} as Entry;
it("edits a planned arrival without altering policies, sibling points, maps or booking metadata", () => {
  const input = editStationTime(entry,"CHECK_IN","2030-12-01","18:30","");
  expect(input.points[0]).toMatchObject({time:"14:00:00",timeMeaning:"NOT_BEFORE",timelineTime:"18:30",timelineUtcOffset:null});
  expect(input.points[1]).toEqual(end);
  expect(input).toMatchObject({notes:entry.notes,reference:entry.reference,bookingSource:entry.bookingSource,version:4});
  expect(start.timelineTime).toBe("17:00:00");
});
it("clears a plan and its offset together while preserving the hotel window", () => {
  expect(editStationTime(entry,"CHECK_IN",start.date,"","+07:00").points[0]).toMatchObject({timelineTime:null,timelineUtcOffset:null,time:"14:00:00"});
});
it("edits only the selected transport endpoint and lets the server revalidate seasonal offsets", () => {
  const flight = {...entry,type:"FLIGHT",points:[{...start,role:"DEPARTURE"},{...end,role:"ARRIVAL"}]} as Entry;
  const input = editStationTime(flight,"ARRIVAL","2030-12-04","12:15","");
  expect(input.points[0]).toEqual(flight.points[0]);
  expect(input.points[1]).toMatchObject({date:"2030-12-04",time:"12:15",timeMeaning:"EXACT",utcOffset:null});
  expect(() => editStationTime(entry,"START",start.date,"10:00","")).toThrow();
});
