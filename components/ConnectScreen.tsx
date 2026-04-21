'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/store';

interface ConnectScreenProps {
  send: (type: string, payload?: Record<string, unknown>) => void;
  connected: boolean;
}

export default function ConnectScreen({ send, connected }: ConnectScreenProps) {
  const { playerName, setPlayerName } = useGameStore();
  const [input, setInput] = useState(playerName);

  const handleEnter = () => {
    if (!input.trim()) return;
    setPlayerName(input.trim());
    useGameStore.setState({ screen: 'lobby' });
    send('GET_ROOMS');
  };

  return (
    <div className="min-h-screen bg-[#0a0500] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-7xl mb-4">🔢</div>
        <h1 className="text-5xl font-black text-amber-400 mb-2" style={{ fontFamily: 'Georgia, serif' }}>A-Math</h1>
        <p className="text-amber-700 text-sm mb-10 tracking-widest uppercase">เกมต่อสมการ Multiplayer</p>

        <div className="bg-[#150900] border border-amber-800/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div>
            <label className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">ชื่อผู้เล่น</label>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              placeholder="ใส่ชื่อของคุณ..."
              maxLength={16}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-amber-500 text-center font-bold placeholder:text-white/20"
            />
          </div>

          <div className={`flex items-center justify-center gap-2 text-xs ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'เชื่อมต่อกับ Server แล้ว' : 'กำลังเชื่อมต่อ...'}
          </div>

          <button
            onClick={handleEnter}
            disabled={!input.trim() || !connected}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:opacity-50 text-white font-black text-lg rounded-xl transition-all shadow-xl disabled:cursor-not-allowed"
          >
            เข้าสู่ล็อบบี้ →
          </button>
        </div>

        <p className="mt-6 text-white/20 text-xs">
          เกมต่อสมการคณิตศาสตร์ 2-4 ผู้เล่น Realtime
        </p>
      </div>
    </div>
  );
}
