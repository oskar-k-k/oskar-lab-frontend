import type { CSSProperties } from "react";

const paths = {
  rotate: "M20 7a9 9 0 1 0 1 8 M20 2v6h-6",
  object:
    "M5 5h14v14H5z M2 5h3 M5 2v3 M19 2v3 M19 5h3 M2 19h3 M5 19v3 M19 19h3 M19 19v3",
  vertex: "M4 4h16v16H4z M9 9h6v6H9z",
  edge: "M5 5h14v14H5z M5 19L19 5",
  face: "M4 4h16v16H4z M8 8h8v8H8z M8 8l8 8 M16 8l-8 8",
  split: "M3 12h6 M15 12h6 M9 9h6v6H9z M3 9v6 M21 9v6",
  connect: "M5 7v10 M19 7v10 M5 12h14 M2 9h6v6H2z M16 9h6v6h-6z",
  duplicate: "M8 8h12v12H8z M4 16H2V2h14v2",
  delete: "M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7",
  add: "M12 4v16 M4 12h16",
  point: "M10 10h4v4h-4z M12 3v3 M12 18v3 M3 12h3 M18 12h3",
  draw: "M3 19L19 3 M3 15v6h6 M15 3h6v6",
  rectangle: "M3 5h18v14H3z",
  triangle: "M12 3l10 18H2z",
  boundary: "M3 3h18v18H3z M7 7l10 10 M17 7L7 17",
  back: "M10 5l-7 7 7 7 M3 12h18",
  close: "M6 6l12 12 M6 18L18 6",
} as const;
export type LabIconName = keyof typeof paths;

/** Consistent decorative SVG icons; interactive parents provide translated accessible names. */
export default function LabIcon({
  name,
  style,
}: {
  name: LabIconName;
  style?: CSSProperties;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
