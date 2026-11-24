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
