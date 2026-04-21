"use client";
import { useState } from "react";
import { Cell, CellType } from "@/lib/types";
import { useGameStore } from "@/lib/store";
import BlankTileDialog from "./BlankTileDialog";

const cellTypeStyles: Record<CellType, string> = {
  NORMAL: "bg-[#c8b890] border-[#a89060]",
  TRIPLE_EQ: "bg-[#b03020] border-[#802010]",
  DOUBLE_EQ: "bg-[#c08010] border-[#906000]",
  TRIPLE_NUM: "bg-[#1e6090] border-[#104070]",
  DOUBLE_NUM: "bg-[#b86010] border-[#904010]",
  STAR: "bg-[#6030a0] border-[#401080]",
};

const cellTypeLabel: Record<CellType, string> = {
  NORMAL: "",
  TRIPLE_EQ: "3E",
  DOUBLE_EQ: "2E",
  TRIPLE_NUM: "3N",
  DOUBLE_NUM: "2N",
  STAR: "★",
};

export default function BoardCell({ cell }: { cell: Cell }) {
  const {
    selectedTile,
    placeOnBoard,
    recallFromBoard,
    selectPlacedTile,
    placedThisTurn,
    serverState,
    myPlayerId,
    invalidCells,
  } = useGameStore();
  const [showBlank, setShowBlank] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const isPlacedThisTurn = placedThisTurn.some(
    (p) => p.row === cell.row && p.col === cell.col,
  );
  const isInvalid = invalidCells.has(`${cell.row},${cell.col}`);
  const isMyTurn =
    serverState?.players[serverState?.currentPlayerIndex]?.id === myPlayerId;
  const canPlace = isMyTurn && selectedTile && !cell.tile;
  const canRecall = isMyTurn && isPlacedThisTurn;
  const canSelectPlaced = isMyTurn && isPlacedThisTurn && !selectedTile;

  const handleClick = () => {
    if (canSelectPlaced) {
      selectPlacedTile(cell.row, cell.col);
    } else if (canRecall) {
      recallFromBoard(cell.row, cell.col);
    } else if (canPlace) {
      placeOnBoard(cell.row, cell.col);
      if (selectedTile?.isBlank) setTimeout(() => setShowBlank(true), 50);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (canSelectPlaced) {
      selectPlacedTile(cell.row, cell.col);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canPlace && !canRecall) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (canPlace && selectedTile) {
      placeOnBoard(cell.row, cell.col);
      if (selectedTile?.isBlank) setTimeout(() => setShowBlank(true), 50);
    }
  };

  const needsBlankValue =
    isPlacedThisTurn && cell.tile?.isBlank && !cell.tile?.blankValue;

  return (
    <>
      {(showBlank || needsBlankValue) && cell.tile && (
        <BlankTileDialog
          tileId={cell.tile.id}
          onClose={() => setShowBlank(false)}
        />
      )}
      <div
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={canSelectPlaced}
        className={`
          relative w-full h-full border flex items-center justify-center
          text-[10px] font-black text-center select-none transition-all duration-100
          ${isInvalid ? "bg-red-600/80 border-red-800 ring-2 ring-red-500 ring-inset" : cellTypeStyles[cell.type]}
          ${canPlace && !isInvalid ? "brightness-125 ring-2 ring-yellow-300 ring-inset cursor-pointer" : ""}
          ${canRecall && !isInvalid ? "ring-2 ring-white ring-inset cursor-pointer" : ""}
          ${canSelectPlaced && !isInvalid ? "ring-2 ring-blue-400 ring-inset cursor-pointer" : ""}
          ${dragOver && (canPlace || canRecall) && !isInvalid ? "brightness-150 ring-2 ring-green-400 ring-inset" : ""}
          ${!cell.tile && !canPlace ? "" : ""}
        `}
      >
        {cell.tile ? (
          <div
            className={`w-[90%] h-[90%] flex flex-col items-center justify-center rounded-sm
            ${isInvalid ? "bg-red-500 border-2 border-red-700 shadow-lg shadow-red-600/50" : isPlacedThisTurn ? "bg-amber-200 border-2 border-amber-400 shadow-md" : "bg-[#f0ddb0] border border-amber-700/50 shadow-sm"}`}
          >
            <span
              className={`font-black leading-none ${isInvalid ? "text-white" : "text-amber-900"} ${(cell.tile.isBlank ? cell.tile.blankValue || "?" : cell.tile.value).length > 2 ? "text-[8px]" : "text-[10px]"}`}
            >
              {cell.tile.isBlank
                ? cell.tile.blankValue || "?"
                : cell.tile.value}
            </span>
            {!cell.tile.isBlank && (
              <span className={`text-[7px] leading-none ${isInvalid ? "text-red-200" : "text-amber-700/70"}`}>
                {cell.tile.points}
              </span>
            )}
          </div>
        ) : (
          <span className="opacity-70 font-bold text-white/80">
            {cellTypeLabel[cell.type]}
          </span>
        )}
      </div>
    </>
  );
}
