import { SVGProps } from "react";

export function PawnIcon(
    props: SVGProps<SVGSVGElement>
) {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
            >
                <circle cx="50" cy="24" r="12" />

                <path d="
                    M40 38
                    H60
                    C59 48 57 57 64 67
                    H36
                    C43 57 41 48 40 38
                    Z
                " />

                <path d="
                    M33 67
                    H67
                    L74 78
                    H26
                    Z
                " />

                <path d="
                    M24 78
                    H76
                    L80 88
                    H20
                    Z
                " />
            </g>
        </svg>
    );
}