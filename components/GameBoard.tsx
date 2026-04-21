"use client";
import { useGameStore } from "@/lib/store";
import BoardCell from "./BoardCell";

export default function GameBoard() {
  const { localBoard } = useGameStore();
  const board = localBoard;
  if (!board)
    return (
      <div
        className="w-full h-full bg-amber-950/20 rounded-xl animate-pulse"
        style={{ aspectRatio: "1/1" }}
      />
    );

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <div
        className="grid border-2 border-amber-900/60 rounded shadow-2xl shadow-amber-900/30 board-grid"
        style={{
          aspectRatio: "1/1",
          gridTemplateColumns: "repeat(15, 1fr)",
          gridTemplateRows: "repeat(15, 1fr)",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => <BoardCell key={`${r}-${c}`} cell={cell} />),
        )}
      </div>
    </div>
  );
}
