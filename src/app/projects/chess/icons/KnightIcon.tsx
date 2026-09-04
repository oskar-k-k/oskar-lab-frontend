import {SVGProps} from "react";

export function KnightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <path d="M30 72 C32 56 42 48 52 42 L39 38 L48 17 C68 25 75 43 68 72 Z" />
                <circle cx="55" cy="31" r="2.5" fill="var(--color-background)" stroke="none" />
                <path d="M25 72 H72 L79 86 H20 Z" />
            </g>
        </svg>
    );
}
