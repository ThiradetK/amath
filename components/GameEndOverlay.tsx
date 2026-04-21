"use client";
import { useGameStore } from "@/lib/store";

// End reason labels (Thai)
const REASON_LABEL: Record<string, string> = {
  EMPTY_HAND: "🎴 มีผู้เล่นใช้เบี้ยหมด",
  ALL_PASS: "🚫 ทุกคนผ่านตาครบรอบ",
  TIMEOUT_STALL: "⏱ หมดเวลาทุกตา",
  DISCONNECT: "🔌 ผู้เล่นออกจากเกม",
};

export default function GameEndOverlay() {
  const { serverState, myPlayerId, goToLobby } = useGameStore();
  if (!serverState || serverState.gamePhase !== "ended") return null;

  const { winner, winners = [], gameEndReason, players } = serverState;

  // Sort players by final score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  // Tie: more than one winner
  const isTie = winners.length > 1;
  const isWinner = winners.some((w: { id: string }) => w.id === myPlayerId);
  const reasonLabel = REASON_LABEL[gameEndReason ?? ""] ?? "";

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#120900] border border-amber-600/40 rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
        {/* Header */}
        <div className="text-6xl mb-3">
          {isTie ? "🤝" : isWinner ? "🏆" : "🎮"}
        </div>
        <h2
          className="text-3xl font-black text-amber-400 mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          จบเกม!
        </h2>

        {/* End reason */}
        {reasonLabel && (
          <p className="text-amber-600/80 text-xs mb-3">{reasonLabel}</p>
        )}

        {/* Winner block */}
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 mb-5">
          {isTie ? (
            <>
              <p className="text-amber-400 font-bold text-sm mb-1">เสมอกัน!</p>
              <p className="text-amber-300 font-black text-lg">
                {winners.map((w: { name: string }) => w.name).join(" & ")}
              </p>
              <p className="text-5xl font-black text-white mt-1 tabular-nums">
                {winners[0]?.score}
                <span className="text-lg text-white/40 ml-2">แต้ม</span>
              </p>
              {isWinner && (
                <p className="text-emerald-400 font-bold text-sm mt-2">
                  🎉 คุณเสมอ!
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-amber-700 text-sm mb-1">ผู้ชนะ</p>
              <p className="text-amber-300 font-black text-xl">
                {winner?.name}
              </p>
              <p className="text-5xl font-black text-white mt-1 tabular-nums">
                {winner?.score}
                <span className="text-lg text-white/40 ml-2">แต้ม</span>
              </p>
              {isWinner && (
                <p className="text-emerald-400 font-bold text-sm mt-2">
                  🎉 คุณชนะ!
                </p>
              )}
            </>
          )}
        </div>

        {/* All players scoreboard */}
        <div className="space-y-2 mb-5">
          {sortedPlayers.map((p, i) => {
            const isMe = p.id === myPlayerId;
            const isTopScore = p.score === sortedPlayers[0].score;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between text-sm px-3 py-1.5 rounded-lg
                  ${isMe ? "bg-amber-500/10 border border-amber-700/30" : "bg-white/5"}`}
              >
                <span className="text-white/60">
                  {medals[i] ?? "  "} {p.name}
                  {isMe ? " (คุณ)" : ""}
                </span>
                <div className="flex items-center gap-2">
                  {/* Show rack penalty if available */}
                  {p.rackPenalty != null && p.rackPenalty > 0 && (
                    <span className="text-red-400/70 text-xs">
                      -{p.rackPenalty}
                    </span>
                  )}
                  {p.emptyHandBonus != null && p.emptyHandBonus > 0 && (
                    <span className="text-emerald-400/70 text-xs">
                      +{p.emptyHandBonus}
                    </span>
                  )}
                  <span
                    className={`font-black tabular-nums ${isTopScore ? "text-amber-300" : "text-white"}`}
                  >
                    {p.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <button
          onClick={goToLobby}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition-all"
        >
          ← กลับล็อบบี้
        </button>
      </div>
    </div>
  );
}
