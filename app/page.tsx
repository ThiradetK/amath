"use client";
import { useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { useWebSocket } from "@/lib/useWebSocket";
import ConnectScreen from "@/components/ConnectScreen";
import LobbyScreen from "@/components/LobbyScreen";
import RoomScreen from "@/components/RoomScreen";
import GameBoard from "@/components/GameBoard";
import PlayerRack from "@/components/PlayerRack";
import GameControls from "@/components/GameControls";
import Scoreboard from "@/components/Scoreboard";
import GameEndOverlay from "@/components/GameEndOverlay";
import BoardLegend from "@/components/BoardLegend";
import MoveHistory from "@/components/MoveHistory";
import ChatBox from "@/components/ChatBox";
import TurnTimer from "@/components/TurnTimer";
import RemainingTiles from "@/components/RemainingTiles";

export default function Home() {
  const { send } = useWebSocket();
  const { screen, connected, serverState, myPlayerId, goToLobby, setSendFn } =
    useGameStore();

  useEffect(() => {
    setSendFn(send);
  }, [send, setSendFn]);

  if (screen === "connect")
    return <ConnectScreen send={send} connected={connected} />;
  if (screen === "lobby") return <LobbyScreen send={send} />;
  if (screen === "room") return <RoomScreen send={send} />;

  // Game screen
  const currentPlayer = serverState?.players[serverState?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;

  return (
    <div
      className="bg-[#0a0500] text-white flex flex-col h-dvh"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <GameEndOverlay />

      {/* Header */}
      <header className="border-b border-amber-900/40 px-4 py-2.5 flex items-center justify-between bg-[#120800] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span>🔢</span>
          <span
            className="text-amber-400 font-black"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A-Math
          </span>
          {serverState && (
            <span className="text-amber-800 text-xs font-mono hidden sm:block">
              #{serverState.roomId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isMyTurn && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              เทิร์นคุณ!
            </span>
          )}
          {!isMyTurn && currentPlayer && (
            <span className="text-white/30 text-xs">
              รอ {currentPlayer.name}...
            </span>
          )}
          <span className="text-amber-700 text-xs hidden sm:block">
            ถุง: {serverState?.tileBagCount}
          </span>
          <button
            onClick={goToLobby}
            className="text-white/20 hover:text-white/50 text-xs transition-all"
          >
            ← ออก
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left: Board */}
        <div className="md:flex-1 flex items-center justify-center bg-[#0a0500] min-h-0 min-w-0 w-full">
          <GameBoard />
        </div>

        {/* Right: Sidebar (Scores, Rack, Controls, History, Chat) - md ขึ้นไป */}
        <div className="hidden md:flex flex-col md:w-[300px] lg:w-[370px] xl:w-[420px] border-l border-amber-900/30 bg-[#0d0700] flex-shrink-0 overflow-hidden">
          <div className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto min-h-0 responsive-controls">
            {/* Scoreboard */}
            <div className="flex-shrink-0">
              <Scoreboard />
            </div>

            {/* Player Rack */}
            <div className="flex-shrink-0">
              <PlayerRack />
            </div>

            {/* Turn Timer */}
            <div className="flex-shrink-0">
              <TurnTimer />
            </div>

            {/* Game Controls */}
            <div className="flex-shrink-0">
              <GameControls />
            </div>

            {/* Move History */}
            <div className="flex-shrink-0">
              <div className="border-t border-white/10 pt-3">
                <h3 className="text-white/25 text-xs uppercase tracking-widest font-bold mb-2">
                  ประวัติ
                </h3>
                <MoveHistory />
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 min-h-0 border-t border-white/10 pt-3 flex flex-col">
              <h3 className="text-white/25 text-xs uppercase tracking-widest font-bold mb-2 flex-shrink-0">
                💬 แชท
              </h3>
              <div className="flex-1 min-h-0">
                <ChatBox />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: board on top (fixed), controls scroll below */}
        <div className="md:hidden flex flex-col overflow-hidden min-h-0 flex-1">
          {/* Mobile scores */}
          <div className="border-b border-amber-900/30 px-2 py-1 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto">
              {serverState?.players.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex-shrink-0 text-center px-2.5 py-1.5 rounded-lg border text-xs
                  ${i === serverState.currentPlayerIndex ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  <div className="font-bold text-[10px]">{p.name}</div>
                  <div className="font-black text-base">{p.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile content scroll */}
          <div
            className="flex-shrink flex flex-col p-3 gap-3 overflow-y-auto"
            style={{ maxHeight: "55vh" }}
          >
            <div className="flex-shrink-0">
              <PlayerRack />
            </div>
            <div className="flex-shrink-0">
              <TurnTimer />
            </div>
            <div className="flex-shrink-0">
              <GameControls />
            </div>
            <div className="flex-shrink-0">
              <div className="border-t border-white/10 pt-3">
                <h3 className="text-white/25 text-xs uppercase tracking-widest font-bold mb-2">
                  ประวัติ
                </h3>
                <MoveHistory />
              </div>
            </div>
          </div>

          {/* Mobile Chat — แยกออกมาอยู่ล่างสุด มี height ชัดเจน */}
          <div
            className="flex-shrink-0 border-t border-white/10 px-3 pb-3 pt-2"
            style={{ height: "180px" }}
          >
            <h3 className="text-white/25 text-xs uppercase tracking-widest font-bold mb-1.5">
              💬 แชท
            </h3>
            <div style={{ height: "140px" }}>
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
