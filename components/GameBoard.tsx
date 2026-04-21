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

  // Responsive: board size = min(100vw, 100vh - header), ใหญ่ขึ้นบนจอใหญ่
  const headerHeight = 49 + 16; // px
  let boardSize = `min(100vw, calc(100vh - ${headerHeight}px))`;
  let maxBoard = 600;
  if (typeof window !== "undefined") {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw >= 1280 || vh >= 900) {
      boardSize = `min(90vw, 90vh)`;
      maxBoard = 800;
    }
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <div
        className="grid border-2 border-amber-900/60 rounded shadow-2xl shadow-amber-900/30"
        style={{
          width: boardSize,
          height: boardSize,
          aspectRatio: "1/1",
          gridTemplateColumns: "repeat(15, 1fr)",
          gridTemplateRows: "repeat(15, 1fr)",
          maxWidth: maxBoard,
          maxHeight: maxBoard,
          minWidth: 180,
          minHeight: 180,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => <BoardCell key={`${r}-${c}`} cell={cell} />),
        )}
      </div>
    </div>
  );
}
