"use client";
import { useGameStore } from "@/lib/store";

interface RoomScreenProps {
  send: (type: string, payload?: Record<string, unknown>) => void;
}

export default function RoomScreen({ send }: RoomScreenProps) {
  const { serverState, myPlayerId, isHost, goToLobby, message } =
    useGameStore();
  if (!serverState) return null;

  const connectedPlayers = serverState.players.filter((p) => p.connected);
  // ✅ derive isHost จาก serverState โดยตรง ป้องกันกรณี store stale
  const amHost = isHost || serverState.hostPlayerId === myPlayerId;
  const canStart = amHost && connectedPlayers.length >= 2;
  const roomId = serverState.roomId;

  return (
    <div className="min-h-screen bg-[#0a0500] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Room code */}
        <div className="text-center">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
            รหัสห้อง
          </p>
          <div
            className="text-6xl font-black text-amber-400 tracking-widest"
            style={{ fontFamily: "monospace" }}
          >
            {roomId}
          </div>
          <p className="text-white/30 text-xs mt-2">แชร์รหัสนี้ให้เพื่อน</p>
        </div>

        {/* Players */}
        <div className="bg-[#150900] border border-amber-800/30 rounded-2xl p-5">
          <h2 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-4">
            ผู้เล่น {connectedPlayers.length}/
            {serverState.players.length > 0 ? serverState.players.length : "?"}
          </h2>
          <div className="space-y-2">
            {serverState.players.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border
                ${p.id === myPlayerId ? "bg-amber-500/15 border-amber-600/40" : "bg-white/5 border-white/10"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm
                  ${p.connected ? "bg-emerald-600" : "bg-gray-600"}`}
                >
                  {i === 0 ? "👑" : i + 1}
                </div>
                <div className="flex-1">
                  <span
                    className={`font-bold ${p.id === myPlayerId ? "text-amber-300" : "text-white/80"}`}
                  >
                    {p.name}
                    {p.id === myPlayerId && (
                      <span className="text-amber-600 text-xs ml-1">(คุณ)</span>
                    )}
                  </span>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${p.connected ? "bg-emerald-400" : "bg-red-500"}`}
                />
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({
              length: Math.max(0, 2 - serverState.players.length),
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-white/10 text-white/20"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">
                  ...
                </div>
                <span className="text-sm">รอผู้เล่น...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center text-amber-300 text-sm bg-amber-500/10 border border-amber-600/20 rounded-xl py-2.5 px-4">
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {isHost ? (
            <button
              onClick={() => send("START_GAME")}
              disabled={!canStart}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-black text-lg rounded-xl transition-all shadow-xl disabled:cursor-not-allowed"
            >
              {canStart
                ? "🚀 เริ่มเกม!"
                : `รอผู้เล่นเพิ่ม (${connectedPlayers.length}/2+)`}
            </button>
          ) : (
            <div className="text-center text-white/30 text-sm py-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              รอ host เริ่มเกม...
            </div>
          )}
          <button
            onClick={goToLobby}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 font-bold rounded-xl transition-all text-sm"
          >
            ← กลับล็อบบี้
          </button>
        </div>
      </div>
    </div>
  );
}
