import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Timeline from "../src/Timeline/Timeline";
it("connects separated same-side items without moving intervening content", () => {
  const html = renderToStaticMarkup(createElement(Timeline, {label:"Stay history",variant:"bubbles",
    ranges:[{fromItemId:"arrival",toItemId:"departure",label:"2 nights"}],
    items:[{id:"arrival",side:"left",label:"Day 1",content:"Arrival"},
      {id:"activity",side:"right",label:"Day 2",content:"Activity"},
      {id:"departure",side:"left",label:"Day 3",content:"Departure"}]}));
  expect(html.indexOf('id="arrival"')).toBeLessThan(html.indexOf('id="activity"'));
  expect(html.indexOf('id="activity"')).toBeLessThan(html.indexOf('id="departure"'));
  expect(html).toContain("2 nights");
  expect(html.match(/<details /g)).toHaveLength(3);
});

it("preserves supplied order, accessible labels and a single current milestone", () => {
  const html = renderToStaticMarkup(
    createElement(Timeline, {
      label: "Example history",
      currentItemId: "second",
      items: [
        {
          id: "first",
          label: "Day one",
          content: createElement("h2", null, "First <booking>"),
        },
        {
          id: "second",
          label: "Day two",
          content: createElement("button", null, "Open details"),
        },
      ],
    }),
  );
  expect(html).toContain("<ol");
  expect(html).toContain('aria-label="Example history"');
  expect(html.indexOf('id="first"')).toBeLessThan(html.indexOf('id="second"'));
  expect(html.match(/aria-current="step"/g)).toHaveLength(1);
  expect(html).toContain("First &lt;booking&gt;");
  expect(html).toContain("<button>Open details</button>");
});

it("does not invent items or an active milestone for an empty sequence", () => {
  const html = renderToStaticMarkup(
    createElement(Timeline, { label: "Empty history", items: [] }),
  );
  expect(html).not.toContain("<li");
  expect(html).not.toContain("aria-current");
});

it("renders bubble details collapsed with a shared exclusive disclosure group and caller-owned visuals", () => {
  const html = renderToStaticMarkup(
    createElement(Timeline, {
      label: "Example trip",
      variant: "bubbles",
      items: [
        {
          id: "a",
          label: "Dec 1",
          title: "Departure",
          visual: createElement("svg", {
            "data-example": "local-illustration",
          }),
          content: createElement("p", null, "Private details"),
        },
        {
          id: "b",
          label: "Dec 2",
          title: "Arrival",
          content: createElement("button", null, "Download"),
        },
      ],
    }),
  );
  expect(html.match(/<details /g)).toHaveLength(2);
  expect(html.match(/<summary /g)).toHaveLength(2);
  expect(html).not.toMatch(/<details[^>]* open/);
  const names = [...html.matchAll(/<details[^>]* name="([^"]+)"/g)].map(
    (m) => m[1],
  );
  expect(names).toHaveLength(2);
  expect(new Set(names).size).toBe(1);
  expect(html).toContain('data-example="local-illustration"');
  expect(html.indexOf("Departure")).toBeLessThan(
    html.indexOf("Private details"),
  );
});

it("keeps paired endpoints inside one timeline position with an accessible connection label", () => {
  const html = renderToStaticMarkup(
    createElement(Timeline, {
      label: "Connected journey",
      variant: "bubbles",
      items: [
        {
          id: "departure",
          label: "Dec 1, 20:00",
          title: "Departure",
          content: "Departure details",
          connectionLabel: "10 hr 20 min",
          end: {
            id: "arrival",
            label: "Dec 2, 12:20",
            title: "Arrival",
            content: "Arrival details",
          },
        },
        {
          id: "hotel",
          label: "Dec 2",
          title: "Hotel",
          content: "Stay details",
        },
      ],
    }),
  );
  expect(html.match(/<li /g)).toHaveLength(2);
  expect(html.match(/<details /g)).toHaveLength(3);
  expect(html).toContain('id="arrival"');
  expect(html.indexOf("Departure")).toBeLessThan(html.indexOf("10 hr 20 min"));
  expect(html.indexOf("10 hr 20 min")).toBeLessThan(html.indexOf("Arrival"));
  expect(html.indexOf("Arrival")).toBeLessThan(html.indexOf('id="hotel"'));
  expect(html).not.toMatch(/<details[^>]* open/);
});

it("shows the caller's opening bubble only in bubble view", () => {
  const props = { label: "Example", items: [], start: "Example date range" };
  const html = renderToStaticMarkup(createElement(Timeline, { ...props, variant: "bubbles" }));
  expect(html).toContain("Example date range");
  expect(html).not.toContain("<summary");
  expect(renderToStaticMarkup(createElement(Timeline, props))).not.toContain("Example date range");
});
