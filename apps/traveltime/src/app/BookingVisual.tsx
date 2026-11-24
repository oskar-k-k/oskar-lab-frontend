import type { Entry } from "./TravelWorkspace";

/** Decorative local illustrations; never fetches photos, maps or private document thumbnails. */
export default function BookingVisual({ type }: { type: Entry["type"] }) {
  const flight = type === "FLIGHT";
  const stay = type === "HOTEL" || type === "APARTMENT";
  const boat = type === "BOAT";
  return (
    <svg
      viewBox="0 0 128 128"
      width="128"
      height="128"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="var(--travel-sky)" d="M0 0h128v128H0z" />
      <circle cx="96" cy="30" r="16" fill="var(--travel-accent)" />
      <path d="M-10 100Q35 60 75 88t70-5v60H-10" fill="var(--travel-sea)" />
      {flight ? (
        <>
          <path
            d="M16 40h29M25 34h27M82 85h30"
            stroke="var(--travel-bg)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="m25 75 29-15-3-25 8-4 13 20 24-11q9-4 12 1t-6 10L80 66l5 25-8 4-15-18-27 11-10-4 12-10Z"
            fill="var(--travel-ink)"
          />
        </>
      ) : stay ? (
        <>
          <path d="M29 48h61v64H29z" fill="var(--travel-bg)" />
          <path d="m24 48 35-22 36 22Z" fill="var(--travel-ink)" />
          <path
            d="M41 61h9v12h-9zm22 0h9v12h-9zM41 83h9v12h-9zm22 0h9v12h-9zM53 100h15v28H53z"
            fill="var(--travel-sea)"
          />
          <path
            d="M106 120V65m0 0q-15-20-26-7 17-1 26 7-2-23 14-24-10 12-14 24 13-15 24-3-13-3-24 3"
            fill="none"
            stroke="var(--travel-ink)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      ) : boat ? (
        <>
          <path d="M20 83h91l-17 23H41Z" fill="var(--travel-ink)" />
          <path d="M43 82V61h42l10 21Z" fill="var(--travel-bg)" />
          <path d="M53 66h8v9h-8zm15 0h8v9h-8z" fill="var(--travel-sea)" />
          <path
            d="M16 114q12-7 24 0t24 0 24 0 24 0"
            fill="none"
            stroke="var(--travel-bg)"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <path
            d="M18 111V67h21v44m5 0V43h25v68m6 0V58h28v53"
            fill="var(--travel-ink)"
          />
          <path
            d="M23 76h9m17-24h14m-14 12h14m17 4h16m-47 9h14"
            stroke="var(--travel-accent)"
            strokeWidth="3"
          />
          <path d="M10 116h111" stroke="var(--travel-bg)" strokeWidth="4" />
        </>
      )}
    </svg>
  );
}
