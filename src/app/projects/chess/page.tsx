"use client";

import Grid from "@/components/Grids/Grid";
import {ChessBoard} from "@/app/projects/chess/classes/ChessBoard";
import ChessSquareView from "@/app/projects/chess/views/ChessSqaureView";
import {Vector, vec} from "@/core/Vector";
import {ChessSquare} from "@/app/projects/chess/classes/ChessSquare";
import {useState} from "react";

export default function ChessPage() {
    const [board] = useState(() => new ChessBoard());
    const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);


    function handleClick(square:ChessSquare){
        setSelectedSquare(square)
        console.log(square)
    }

    return (
        <Grid cols={8} rows={8} gap={0}>
            {board.squares.map((pos, square) => (
                <ChessSquareView
                    key={pos.toString()}
                    square={square}
                    selected={selectedSquare === square}
                    onClick={handleClick}
                ></ChessSquareView>
            ))}
        </Grid>
    );
}
