"use client";

import Grid from "@/components/Grids/Grid";
import {Array2D} from "@/core/Array2D";

const board = new Array2D<number>(8, 8, 0);


export default function ChessPage() {

    function handleClick(item: number, row: number, col: number) {
        console.log("Item:", item);
        console.log("Position:", row, col);
    }

    return (
        <Grid cols={board.cols} rows={board.rows} gap={0}>
            {board.map((item, row, col) => (
                <span
                    key={`${row}-${col}`}
                    onClick={() => handleClick(item, row, col)}
                    style={{
                        background:
                            (row + col) % 2 === 0
                                ? "#eeeed2"
                                : "#769656",
                        aspectRatio: "1",
                        color: "#225522"
                    }}
                >  ( {`${row}-${col}`} )  </span>
            ))}
        </Grid>
    );
}
