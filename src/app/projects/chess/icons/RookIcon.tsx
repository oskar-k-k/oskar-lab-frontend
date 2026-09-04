import {SVGProps} from "react";

export function RookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
                <path d="M25 16 H38 V27 H45 V16 H55 V27 H62 V16 H75 V38 H25 Z" />
                <path d="M32 38 H68 L65 72 H35 Z" />
                <path d="M28 72 H72 L78 86 H22 Z" />
            </g>
        </svg>
    );
}
