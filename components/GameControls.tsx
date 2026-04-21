"use client";
import { useGameStore } from "@/lib/store";
import { calculateScorePreview } from "@/lib/gameLogic";

export default function GameControls() {
  const {
    commitMove,
    passMove,
    recallAll,
    placedThisTurn,
    serverState,
    localBoard,
    myPlayerId,
    message,
    exchangeMode,
    exchangeSelected,
    startExchange,
    toggleExchangeTile,
    confirmExchange,
    cancelExchange,
  } = useGameStore();

  // ✅ เซ็ตค่า default ก่อน return
  const isMyTurn =
    serverState?.players[serverState?.currentPlayerIndex]?.id === myPlayerId;
  const currentName =
    serverState?.players[serverState?.currentPlayerIndex]?.name;
  const scorePreview =
    placedThisTurn.length > 0 && serverState && localBoard
      ? calculateScorePreview(localBoard, placedThisTurn)
      : 0;

  const isError =
    message &&
    (message.includes("ไม่") ||
      message.includes("ต้อง") ||
      message.includes("กรุณา"));
  const isSuccess =
    message &&
    (message.includes("+") ||
      message.includes("บิงโก") ||
      message.includes("ได้"));

  const myPlayer = serverState?.players.find((p) => p.id === myPlayerId);

  // ✅ Early return ได้หลังจาก hook ทั้งหมด
  if (!serverState || serverState.gamePhase !== "playing") return null;

  return (
    <div className="space-y-2.5">
      {message && (
        <div
          className={`text-center text-xs lg:text-base font-bold px-3 py-2 rounded-lg border
          ${
            isSuccess
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-600/30"
              : isError
                ? "bg-red-500/15 text-red-300 border-red-600/30"
                : "bg-amber-500/10 text-amber-300 border-amber-600/20"
          }`}
        >
          {message}
        </div>
      )}

      {!isMyTurn ? (
        <div className="text-center text-white/30 text-xs lg:text-base py-2 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          รอ {currentName} เล่น...
        </div>
      ) : !exchangeMode ? (
        <div className="space-y-2">
          {placedThisTurn.length > 0 && (
            <div className="text-center bg-emerald-500/15 border border-emerald-600/30 rounded-lg py-2 px-3">
              <span className="text-emerald-300 text-xs lg:text-base font-bold">
                💰 คะแนนที่จะได้: {scorePreview}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={commitMove}
              disabled={placedThisTurn.length === 0}
              className="py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs lg:text-base transition-all disabled:cursor-not-allowed"
            >
              ✅ ยืนยัน
            </button>
            <button
              onClick={recallAll}
              disabled={placedThisTurn.length === 0}
              className="py-2.5 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs lg:text-base transition-all disabled:cursor-not-allowed"
            >
              ↩ คืนเบี้ย
            </button>
            <button
              onClick={passMove}
              className="py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-xs lg:text-base transition-all"
            >
              ⏭ ผ่านตา
            </button>
            <button
              onClick={startExchange}
              disabled={(serverState.tileBagCount || 0) < 5}
              className="py-2.5 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs lg:text-base transition-all disabled:cursor-not-allowed"
            >
              🔄 เปลี่ยนเบี้ย
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-amber-300 text-[10px] lg:text-base font-bold text-center">
            คลิกเบี้ยที่ต้องการเปลี่ยน
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {myPlayer?.rack?.map((tile, idx) => (
              <button
                key={tile.id}
                onClick={() => toggleExchangeTile(idx)}
                className={`w-9 h-11 flex flex-col items-center justify-center rounded border-2 font-black text-xs lg:text-base transition-all
                  ${exchangeSelected.includes(idx) ? "bg-blue-400 border-blue-200 text-white scale-110" : "bg-[#f0ddb0] border-amber-600 text-amber-900"}`}
              >
                <span>{tile.value === "BLANK" ? "?" : tile.value}</span>
                <span className="text-[7px] opacity-50">{tile.points}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={confirmExchange}
              disabled={exchangeSelected.length === 0}
              className="py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs lg:text-base transition-all"
            >
              ยืนยัน ({exchangeSelected.length})
            </button>
            <button
              onClick={cancelExchange}
              className="py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-xs lg:text-base transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
