import {SVGProps} from "react";

export function QueenIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <circle cx="25" cy="24" r="5" />
                <circle cx="50" cy="17" r="5" />
                <circle cx="75" cy="24" r="5" />
                <path d="M25 29 L35 66 H65 L75 29 L59 48 L50 22 L41 48 Z" />
                <path d="M29 66 H71 L78 86 H22 Z" />
            </g>
        </svg>
    );
}
