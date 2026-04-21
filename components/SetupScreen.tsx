'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/store';

export default function SetupScreen() {
  const { initGame } = useGameStore();
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['ผู้เล่น 1', 'ผู้เล่น 2', 'ผู้เล่น 3', 'ผู้เล่น 4']);
  const [aiFlags, setAiFlags] = useState([false, false, false, false]);

  const handleStart = () => {
    initGame(names.slice(0, playerCount), aiFlags.slice(0, playerCount));
  };

  const toggleAI = (i: number) => {
    const next = [...aiFlags];
    next[i] = !next[i];
    if (next[i] && names[i] === `ผู้เล่น ${i + 1}`) {
      const n = [...names]; n[i] = `คอมฯ ${i + 1}`; setNames(n);
    }
    setAiFlags(next);
  };

  return (
    <div className="min-h-screen bg-[#0f0800] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🔢</div>
          <h1 className="text-6xl font-black text-amber-400 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>A-Math</h1>
          <p className="text-amber-700 mt-2 text-sm tracking-widest uppercase font-semibold">เกมต่อสมการคณิตศาสตร์</p>
        </div>

        <div className="bg-[#1a0c00] border border-amber-800/40 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Player count */}
          <div>
            <label className="text-amber-300 text-xs font-bold tracking-widest uppercase block mb-3">จำนวนผู้เล่น</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setPlayerCount(n)}
                  className={`flex-1 py-3 rounded-xl font-black text-xl transition-all border-2
                    ${playerCount === n ? 'bg-amber-500 border-amber-300 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Player names + AI toggle */}
          <div className="space-y-3">
            <label className="text-amber-300 text-xs font-bold tracking-widest uppercase block">ผู้เล่น</label>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0
                  ${aiFlags[i] ? 'bg-purple-600' : 'bg-amber-600'}`}>
                  {aiFlags[i] ? '🤖' : i + 1}
                </div>
                <input
                  value={names[i]}
                  onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n); }}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder={`ผู้เล่น ${i + 1}`}
                />
                <button onClick={() => toggleAI(i)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex-shrink-0
                    ${aiFlags[i] ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-white/5 border-white/20 text-white/40 hover:bg-white/10'}`}>
                  AI
                </button>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">ช่องคะแนนพิเศษ</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { color: 'bg-[#c0392b]', label: 'Triple Equation ×3' },
                { color: 'bg-[#f39c12]', label: 'Double Equation ×2' },
                { color: 'bg-[#2980b9]', label: 'Triple Number ×3' },
                { color: 'bg-[#e67e22]', label: 'Double Number ×2' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color} flex-shrink-0`} />
                  <span className="text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-black text-lg rounded-xl transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0">
            🚀 เริ่มเกม
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
