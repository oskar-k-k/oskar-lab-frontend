import { useId } from "react";
import type { Entry } from "./TravelWorkspace";

/** Local night-travel artwork, with no remote media or private booking information. */
export default function BookingVisual({ type }: { type: Entry["type"] }) {
  const id = useId().replaceAll(":", "");
  const flight = type === "FLIGHT";
  const stay = type === "HOTEL" || type === "APARTMENT";
  const boat = type === "BOAT";
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x2="0.8" y2="1">
          <stop stopColor="#0e182b" /><stop offset="1" stopColor="#28435a" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x2="0.3" y2="1">
          <stop stopColor="#357e87" /><stop offset="1" stopColor="#152e48" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0h160v160H0z" />
      <g fill="#e4f0f6"><circle cx="26" cy="32" r="1" /><circle cx="62" cy="17" r="1.2" /><circle cx="139" cy="53" r="1" /><circle cx="86" cy="38" r="0.8" /></g>
      <circle cx="119" cy="38" r="17" fill="#e9c88f" />
      {flight ? <>
        <path d="M-5 119q24-30 49-12 12-25 37-11 30-24 56-3 25 0 34 24v50H-5Z" fill="#4a697e" />
        <path d="M-5 140q28-24 56-9 27-20 53-5 30-19 61-5v45H-5Z" fill="#273e56" />
        <path d="m31 90 32-17-2-31 9-5 16 25 29-13q11-5 15 1t-7 12L97 79l6 31-10 5-19-23-31 12-12-5 14-10Z" fill="#eff6f6" />
        <path d="m20 100-15 8m19 2-9 5" stroke="#b7d9dd" strokeWidth="2" strokeLinecap="round" />
      </> : boat ? <>
        <path d="M0 93q32-8 65 0t95-1v68H0Z" fill={`url(#${id}-sea)`} />
        <path d="m0 97 20-50 12 14 6-25 15 29 6 36Z" fill="#142b39" />
        <path d="M27 110q46 11 96-2l20-14-9 25q-50 21-94 5Z" fill="#d6b181" />
        <path d="m55 105 5-24h49l9 25" fill="#172939" /><path d="M55 83h59" stroke="#eddbb8" strokeWidth="4" />
        <path d="m126 114 14 23m-25-37 28-9" stroke="#d6b181" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 139h38m14 8h40m17-10h28M93 64h17m-12 9h22" stroke="#9ac9cc" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
      </> : stay ? <>
        <path d="M0 111q50-23 160-6v55H0Z" fill={`url(#${id}-sea)`} />
        <path d="M31 99V68h69v36Z" fill="#b99169" /><path d="m22 69 42-29 45 29Z" fill="#182936" />
        <path d="M43 79h13v19H43zm30 0h13v19H73Z" fill="#f3d5a3" />
        <path d="M120 130V63m0 0q-23-24-33-10 20 0 33 10-4-31 16-34-15 16-16 34 19-21 35-6-19-4-35 6" stroke="#6b9c9d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M23 122h61m-51 9h37m-16 10h40" stroke="#b2d6d2" strokeOpacity=".35" strokeWidth="2" />
      </> : <>
        <path d="M12 133V88h22v45m6 0V67h26v66m7 0V80h29v53m8 0V57h28v76" fill="#142638" />
        <path d="M20 98h6m22-20h10m-10 14h10m22 0h14m-14 15h14m25-37h12m-12 15h12" stroke="#e9c88f" strokeWidth="3" />
        <path d="M0 138h160v22H0Z" fill="#223b4b" /><path d="M28 137h104" stroke="#9bd4ce" strokeWidth="2" />
        <path d="M50 126v-16h57v16M64 110v-9h29v9" fill="#a6c9c6" />
      </>}
    </svg>
  );
}
