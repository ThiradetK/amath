"use client";
import { useEffect } from "react";
import { useGameStore } from "@/lib/store";

export default function TurnTimer() {
  const { serverState, myPlayerId, turnTimeLeft, setTurnTimeLeft, passMove } =
    useGameStore();

  // ✅ Compute derived values BEFORE any hooks — never conditionally
  const isPlaying = !!serverState && serverState.gamePhase === "playing";
  const isMyTurn =
    isPlaying &&
    serverState!.players[serverState!.currentPlayerIndex]?.id === myPlayerId;

  // ✅ useEffect always runs — guards are INSIDE the effect
  useEffect(() => {
    if (!isPlaying || !isMyTurn) return;

    if ((turnTimeLeft || 0) <= 0) {
      passMove();
      return;
    }

    const timeout = setTimeout(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isPlaying, isMyTurn, turnTimeLeft, setTurnTimeLeft, passMove]);

  // ✅ Conditional rendering AFTER all hooks
  if (!isPlaying || !isMyTurn) return null;

  const safeTime = Math.max(0, turnTimeLeft || 0);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const isWarning = safeTime <= 60;

  return (
    <div
      className={`text-center text-lg lg:text-5xl font-black transition-all
        ${isWarning ? "text-red-400 animate-pulse" : "text-emerald-400"}`}
    >
      ⏱️ {minutes.toString().padStart(1, "0")}:
      {seconds.toString().padStart(2, "0")}
    </div>
  );
}
