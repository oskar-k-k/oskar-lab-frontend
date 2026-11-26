import { useId } from "react";
import type { Entry } from "./TravelWorkspace";

/** Local night-travel artwork, with no remote media or private booking information. */
export default function BookingVisual({ type }: { type: Entry["type"] }) {
  const id = useId().replaceAll(":", "");
  const flight = type === "FLIGHT";
  const stay = type === "HOTEL" || type === "APARTMENT";
  const boat = type === "BOAT";
  if (flight || stay || boat) return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#9bbdc9" />
        </linearGradient>
        <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6ba9aa" /><stop offset="1" stopColor="#254759" />
        </linearGradient>
      </defs>
      {flight ? <>
        <path d="m11 117 25-13m-13 27 18-10" stroke="#87b8c5" strokeWidth="2" strokeLinecap="round" opacity=".5" />
        <path d="m30 99 35-23-9-44 11-7 26 35 34-20q16-9 22-1t-9 20l-34 24 7 43-12 8-27-34-27 13-17-7 15-10Z" fill={`url(#${id}-body)`} stroke="#c8e0e6" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m73 76 20-16-26-35 13 42m5 22 21-6 7 43-16-30" fill="#7eacbc" opacity=".7" />
        <path d="m127 43 7 2 3 6" fill="none" stroke="#21475b" strokeWidth="4" strokeLinecap="round" />
        <path d="m91 70 3-2m5-3 3-2m5-3 3-2m5-3 3-2" stroke="#284c60" strokeWidth="3" strokeLinecap="round" />
        <path d="m32 99 15-8 8 10-8 12" fill="#d8b886" />
      </> : boat ? <>
        <path d="M30 111 22 94h118l-17 31H47Z" fill="#c29b6d" stroke="#ebd4ae" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m25 101 107 8-9 16H47Z" fill="#5d6c70" />
        <path d="M47 93V66h64l13 27Z" fill={`url(#${id}-body)`} />
        <path d="M38 65h78l-7-9H48Z" fill={`url(#${id}-roof)`} stroke="#94bfc5" strokeWidth="1.5" />
        <path d="M80 55V33m0 3h25l-7 9H80" fill="#dfb982" stroke="#dfb982" strokeWidth="2" strokeLinejoin="round" />
        <path d="M56 73h12v13H56zm21 0h12v13H77zm21 0h10l6 13H98Z" fill="#294e63" />
        <path d="M41 94h90" stroke="#f6e4c4" strokeWidth="3" strokeLinecap="round" />
        <g fill="none" stroke="#8bc3c8" strokeWidth="2" strokeLinecap="round">
          <path d="M17 133q10-5 20 0t20 0m11 0q10-5 20 0t20 0m11 0q10-5 20 0" />
          <path d="M43 143h26m14 0h30" opacity=".4" />
        </g>
      </> : <>
        <path d="M38 77 80 43l42 34v58H38Z" fill={`url(#${id}-body)`} stroke="#c6dde0" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M109 57V36h-13v11" fill="#72939e" />
        <path d="m23 78 57-48 57 48-9 10-48-40-48 40Z" fill={`url(#${id}-roof)`} stroke="#9cc5c9" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M69 135V98h23v37" fill="#33566a" /><path d="M72 101h17v22H72Z" fill="#efd19a" />
        <path d="M47 91h15v21H47zm51 0h15v21H98Z" fill="#efcc90" stroke="#577b88" strokeWidth="2" />
        <path d="M54 92v19m51-19v19M48 102h13m38 0h13" stroke="#6c8c93" strokeWidth="1.5" />
        <path d="M64 136h33l5 7H59Z" fill="#a7bbc0" />
        <path d="M28 132v-25m0 8q-15-14-17-3 5 9 17 3 11-20 17-11 1 10-17 11" fill="#6c9f95" stroke="#6c9f95" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 126h18l-3 12H22Z" fill="#c5a27a" />
      </>}
    </svg>
  );
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x2="0.8" y2="1">
          <stop stopColor="#0e182b" /><stop offset="1" stopColor="#28435a" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0h160v160H0z" />
      <g fill="#e4f0f6"><circle cx="26" cy="32" r="1" /><circle cx="62" cy="17" r="1.2" /><circle cx="139" cy="53" r="1" /><circle cx="86" cy="38" r="0.8" /></g>
      <circle cx="119" cy="38" r="17" fill="#e9c88f" />
      <>
        <path d="M12 133V88h22v45m6 0V67h26v66m7 0V80h29v53m8 0V57h28v76" fill="#142638" />
        <path d="M20 98h6m22-20h10m-10 14h10m22 0h14m-14 15h14m25-37h12m-12 15h12" stroke="#e9c88f" strokeWidth="3" />
        <path d="M0 138h160v22H0Z" fill="#223b4b" /><path d="M28 137h104" stroke="#9bd4ce" strokeWidth="2" />
        <path d="M50 126v-16h57v16M64 110v-9h29v9" fill="#a6c9c6" />
      </>
    </svg>
  );
}
