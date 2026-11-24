import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Timeline from "../src/Timeline/Timeline";

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
