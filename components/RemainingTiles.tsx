"use client";
import { useGameStore } from "@/lib/store";
import { calculateRemainingTiles, TILE_DISTRIBUTION } from "@/lib/constants";

export default function RemainingTiles() {
  const { serverState, localBoard } = useGameStore();

  if (!serverState || serverState.gamePhase !== "playing" || !localBoard) {
    return null;
  }

  const remaining = calculateRemainingTiles(localBoard, serverState.players);

  // Group tiles by type
  const numbers = Object.entries(remaining)
    .filter(([key]) => !isNaN(Number(key)) && key !== "BLANK")
    .sort(([a], [b]) => Number(a) - Number(b));

  const operators = Object.entries(remaining)
    .filter(([key]) => isNaN(Number(key)) && key !== "BLANK")
    .sort(([a], [b]) => a.localeCompare(b));

  const blanks = remaining["BLANK"] || 0;

  return (
    <div className="bg-white/10 border-2 border-white rounded-lg p-3">
      <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">
        📊 เบี้ยคงเหลือ
      </h3>

      {/* Numbers */}
      <div className="mb-3">
        <h4 className="text-white text-xs font-semibold mb-1">ตัวเลข:</h4>
        <div className="grid grid-cols-6 gap-1">
          {numbers.map(([tile, count]) => (
            <div
              key={tile}
              className="flex flex-col items-center justify-center bg-blue-500/80 rounded border border-blue-300 p-1"
            >
              <span className="text-sm font-black text-white leading-none">
                {tile}
              </span>
              <span className="text-xs font-bold text-white">×{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operators */}
      <div className="mb-3">
        <h4 className="text-white text-xs font-semibold mb-1">เครื่องหมาย:</h4>
        <div className="grid grid-cols-5 gap-1">
          {operators.map(([tile, count]) => (
            <div
              key={tile}
              className="flex flex-col items-center justify-center bg-green-500/80 rounded border border-green-300 p-1"
            >
              <span className="text-sm font-black text-white leading-none">
                {tile === "-" ? "−" : tile === "×" ? "×" : tile}
              </span>
              <span className="text-xs font-bold text-white">×{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Blanks */}
      {blanks > 0 && (
        <div>
          <h4 className="text-white text-xs font-semibold mb-1">เบี้ยเปล่า:</h4>
          <div className="flex items-center justify-center bg-gray-500/80 rounded border border-gray-300 p-1 w-fit">
            <span className="text-sm font-black text-white leading-none">
              ?
            </span>
            <span className="text-xs font-bold text-white ml-1">×{blanks}</span>
          </div>
        </div>
      )}
    </div>
  );
}
