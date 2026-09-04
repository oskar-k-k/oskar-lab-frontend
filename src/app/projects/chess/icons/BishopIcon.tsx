import {SVGProps} from "react";

export function BishopIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <path d="M50 14 C65 28 68 39 56 51 L65 70 H35 L44 51 C32 39 35 28 50 14 Z" />
                <path d="M45 25 L56 42" fill="none" stroke="var(--color-background)" strokeWidth="4" />
                <path d="M29 70 H71 L78 86 H22 Z" />
            </g>
        </svg>
    );
}
