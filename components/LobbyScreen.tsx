"use client";
import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store";

interface LobbyScreenProps {
  send: (type: string, payload?: Record<string, unknown>) => void;
}

export default function LobbyScreen({ send }: LobbyScreenProps) {
  const { playerName, roomList } = useGameStore();
  const [joinId, setJoinId] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [creating, setCreating] = useState(false);

  // Refresh room list every 3s
  useEffect(() => {
    const interval = setInterval(() => send("GET_ROOMS"), 3000);
    return () => clearInterval(interval);
  }, [send]);

  const handleCreate = () => {
    send("CREATE_ROOM", { name: playerName, maxPlayers });
  };

  const handleJoin = (roomId: string) => {
    send("JOIN_ROOM", { roomId, name: playerName });
  };

  return (
    <div className="min-h-screen bg-[#0a0500] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-amber-900/40 px-3 sm:px-5 py-3 flex items-center justify-between bg-[#120800]">
        <div className="flex items-center gap-2">
          <span>🔢</span>
          <span
            className="text-amber-400 font-black"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A-Math
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {playerName}
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto p-2 sm:p-5 space-y-4 sm:space-y-5">
        {/* Create room */}
        <div className="bg-[#150900] border border-amber-800/30 rounded-2xl p-3 sm:p-5">
          <h2 className="text-amber-400 font-black text-base sm:text-lg mb-3 sm:mb-4">
            ➕ สร้างห้องใหม่
          </h2>
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition-all text-base sm:text-lg"
            >
              สร้างห้อง
            </button>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest block mb-1 sm:mb-2">
                  จำนวนผู้เล่น
                </label>
                <div className="flex gap-1 sm:gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxPlayers(n)}
                      className={`flex-1 py-2 rounded-xl font-black text-base sm:text-lg border-2 transition-all
                        ${maxPlayers === n ? "bg-amber-500 border-amber-400 text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition-all text-base sm:text-lg"
                >
                  ✅ สร้างห้อง {maxPlayers} คน
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 text-white/50 font-bold rounded-xl transition-all text-base sm:text-lg"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Join by code */}
        <div className="bg-[#150900] border border-amber-800/30 rounded-2xl p-3 sm:p-5">
          <h2 className="text-amber-400 font-black text-base sm:text-lg mb-2 sm:mb-3">
            🔑 เข้าห้องด้วยรหัส
          </h2>
          <div className="flex gap-1 sm:gap-2">
            <input
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              onKeyDown={(e) =>
                e.key === "Enter" && joinId && handleJoin(joinId)
              }
              placeholder="รหัสห้อง 5 ตัวอักษร"
              maxLength={5}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-white font-black text-base sm:text-lg text-center uppercase tracking-widest focus:outline-none focus:border-amber-500 placeholder:text-white/20 placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
            />
            <button
              onClick={() => joinId && handleJoin(joinId)}
              disabled={!joinId}
              className="px-3 sm:px-5 py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-black rounded-xl transition-all text-base sm:text-lg"
            >
              เข้า
            </button>
          </div>
        </div>

        {/* Room list */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-amber-400 font-black text-base sm:text-lg">
              🚪 ห้องที่เปิดอยู่
            </h2>
            <button
              onClick={() => send("GET_ROOMS")}
              className="text-white/30 hover:text-white/60 text-xs transition-all"
            >
              🔄 รีเฟรช
            </button>
          </div>
          {roomList.length === 0 ? (
            <div className="text-center text-white/20 py-6 sm:py-8 bg-[#150900] border border-amber-800/20 rounded-2xl">
              <div className="text-2xl sm:text-3xl mb-2">🏜️</div>
              <p className="text-sm sm:text-base">ยังไม่มีห้องที่เปิดอยู่</p>
              <p className="text-xs mt-1">สร้างห้องใหม่เพื่อเริ่มเล่น</p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {roomList.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between bg-[#150900] border border-amber-800/25 rounded-xl px-2 sm:px-4 py-2 sm:py-3"
                >
                  <div>
                    <span className="font-black text-amber-300 tracking-widest text-base sm:text-lg">
                      {room.id}
                    </span>
                    <span className="ml-2 sm:ml-3 text-white/40 text-xs sm:text-sm">
                      {room.playerCount}/{room.maxPlayers} คน
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoin(room.id)}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs sm:text-sm transition-all"
                  >
                    เข้าร่วม
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
