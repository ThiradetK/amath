"use client";
import { useState } from "react";
import { useGameStore } from "@/lib/store";

/**
 * SetupScreen — ตั้งชื่อผู้เล่นก่อนเข้า lobby
 * ใช้ setPlayerName() จาก store แล้ว transition ไป ConnectScreen
 */
export default function SetupScreen() {
  const { playerName, setPlayerName } = useGameStore();
  const [input, setInput] = useState(playerName || "");

  const handleConfirm = () => {
    const name = input.trim() || "ผู้เล่น";
    setPlayerName(name);
  };

  return (
    <div className="min-h-screen bg-[#0f0800] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🔢</div>
          <h1
            className="text-6xl font-black text-amber-400 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A-Math
          </h1>
          <p className="text-amber-700 mt-2 text-sm tracking-widest uppercase font-semibold">
            เกมต่อสมการคณิตศาสตร์
          </p>
        </div>

        <div className="bg-[#1a0c00] border border-amber-800/40 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Player name */}
          <div>
            <label className="text-amber-300 text-xs font-bold tracking-widest uppercase block mb-3">
              ชื่อผู้เล่น
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-amber-500"
              placeholder="ใส่ชื่อของคุณ"
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Legend */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">
              ช่องคะแนนพิเศษ
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { color: "bg-[#c0392b]", label: "Triple Equation ×3" },
                { color: "bg-[#f39c12]", label: "Double Equation ×2" },
                { color: "bg-[#2980b9]", label: "Triple Number ×3" },
                { color: "bg-[#e67e22]", label: "Double Number ×2" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color} flex-shrink-0`} />
                  <span className="text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!input.trim()}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-xl transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            🚀 ถัดไป
          </button>
        </div>

        <div className="mt-4 text-center text-white/20 text-xs space-y-1">
          <p>เบี้ย 100 ตัว • กระดาน 15×15 • เริ่มต้น 8 เบี้ย/คน</p>
          <p>บิงโก (วาง 8 ตัวในตาเดียว) = +40 แต้มพิเศษ</p>
        </div>
      </div>
    </div>
  );
}
