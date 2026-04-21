'use client';
import { useGameStore } from '@/lib/store';

export default function Scoreboard() {
  const { serverState, myPlayerId } = useGameStore();
  if (!serverState) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-amber-600 font-bold text-[10px] lg:text-base tracking-widest uppercase">คะแนน</h2>
      {serverState.players.map((player, i) => {
        const isCurrent = i === serverState.currentPlayerIndex && serverState.gamePhase === 'playing';
        const isMe = player.id === myPlayerId;
        return (
          <div key={player.id} className={`p-2.5 rounded-lg border transition-all
            ${isCurrent ? 'bg-amber-500/20 border-amber-500/50 shadow-md' : 'bg-white/5 border-white/10'}
            ${isMe ? 'ring-1 ring-amber-600/40' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                {!player.connected && <span className="text-red-400 text-xs">⚡</span>}
                <span className={`font-bold text-xs lg:text-base truncate max-w-[90px] ${isCurrent ? 'text-amber-300' : isMe ? 'text-amber-500' : 'text-white/70'}`}>
                  {player.name}{isMe ? ' (คุณ)' : ''}
                </span>
              </div>
              <span className={`font-black text-sm lg:text-2xl tabular-nums ${isCurrent ? 'text-amber-300' : 'text-white/50'}`}>
                {player.score}
              </span>
            </div>
            <div className="text-[10px] lg:text-sm text-white/25 mt-0.5">เบี้ย: {player.rackCount}</div>
          </div>
        );
      })}
    </div>
  );
}
