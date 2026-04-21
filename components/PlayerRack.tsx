"use client";
import { useGameStore } from "@/lib/store";

export default function PlayerRack() {
  const { serverState, myPlayerId, selectedTile, selectTile, placedThisTurn } =
    useGameStore();
  if (!serverState) return null;

  const myPlayer = serverState.players.find((p) => p.id === myPlayerId);
  const isMyTurn =
    serverState.players[serverState.currentPlayerIndex]?.id === myPlayerId;

  if (!myPlayer?.rack)
    return (
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-3 text-center text-white/30 text-sm">
        กำลังโหลดเบี้ย...
      </div>
    );

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${isMyTurn ? "bg-amber-950/40 border-amber-600/50 shadow-lg shadow-amber-900/20" : "bg-white/5 border-white/10"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs lg:text-base font-bold text-amber-400">
          🎴 เบี้ยของคุณ{" "}
          {isMyTurn && (
            <span className="text-emerald-400 ml-1">← เทิร์นคุณ!</span>
          )}
        </span>
        <div className="text-[10px] lg:text-sm text-amber-700 flex gap-3">
          <span>
            ถุง:{" "}
            <span className="text-amber-300 font-bold">
              {serverState.tileBagCount}
            </span>
          </span>
          <span>
            ของคุณ:{" "}
            <span className="text-amber-300 font-bold">
              {myPlayer.rack.length}
            </span>
          </span>
        </div>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap min-h-[52px] player-rack">
        {myPlayer.rack.map((tile, idx) => {
          const isSelected = selectedTile?.id === tile.id;
          const isPlaced = placedThisTurn.some((p) => p.tile.id === tile.id);
          const displayVal = tile.isBlank ? tile.blankValue || "?" : tile.value;

          const handleDragStart = (e: React.DragEvent) => {
            e.dataTransfer!.effectAllowed = "move";
            e.dataTransfer!.setData("tileId", tile.id);
            selectTile(tile, idx);
          };

          return (
            <button
              key={tile.id}
              draggable={!isPlaced && isMyTurn}
              onDragStart={handleDragStart}
              onClick={() => !isPlaced && isMyTurn && selectTile(tile, idx)}
              disabled={isPlaced || !isMyTurn}
              className={`w-10 h-12 flex flex-col items-center justify-center rounded border-2 font-black transition-all select-none player-tile
                ${
                  isPlaced
                    ? "opacity-25 bg-amber-800 border-amber-700 cursor-not-allowed"
                    : !isMyTurn
                      ? "opacity-50 bg-[#f0ddb0] border-amber-600 text-amber-900 cursor-not-allowed"
                      : isSelected
                        ? "bg-yellow-300 border-yellow-400 text-amber-900 scale-110 -translate-y-1.5 shadow-lg shadow-yellow-300/50 cursor-grab active:cursor-grabbing"
                        : "bg-[#f0ddb0] border-amber-600 text-amber-900 hover:bg-yellow-200 hover:scale-105 hover:-translate-y-0.5 cursor-grab hover:shadow-md shadow-md"
                }`}
            >
              <span
                className={`leading-none ${displayVal.length > 2 ? "text-xs" : "text-base"}`}
              >
                {displayVal}
              </span>
              <span className="text-[10px] font-semibold opacity-80 mt-0.5">
                {tile.isBlank ? "0" : tile.points}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
