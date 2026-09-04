import {SVGProps} from "react";

export function KingIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <path d="M50 12 V34 M40 22 H60" fill="none" strokeWidth="6" />
                <path d="M36 38 C36 27 64 27 64 38 C64 47 58 51 61 67 H39 C42 51 36 47 36 38 Z" />
                <path d="M29 67 H71 L78 86 H22 Z" />
            </g>
        </svg>
    );
}
