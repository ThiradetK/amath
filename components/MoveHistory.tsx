'use client';
import { useGameStore } from '@/lib/store';

export default function MoveHistory() {
  const { serverState } = useGameStore();
  const history = serverState?.moveHistory || [];
  const reversed = [...history].reverse();

  if (!history.length) return <div className="text-white/20 text-[10px] lg:text-sm text-center py-3">ยังไม่มีการเดิน</div>;

  return (
    <div className="space-y-1.5 max-h-40 overflow-y-auto">
      {reversed.map((record, idx) => (
        <div key={idx} className={`text-[10px] lg:text-sm rounded-lg px-2 py-1.5 border
          ${record.type === 'place' ? 'bg-emerald-900/20 border-emerald-800/30'
          : record.type === 'pass' ? 'bg-white/5 border-white/10'
          : 'bg-blue-900/20 border-blue-800/30'}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-white/60 truncate max-w-[100px]">{record.playerName}</span>
            <div className="flex items-center gap-1">
              {record.bingo && <span className="text-yellow-400 text-[9px] font-black">BINGO!</span>}
              {record.score > 0 && <span className="text-emerald-400 font-black">+{record.score}</span>}
              {record.type === 'pass' && <span className="text-white/30">ผ่าน</span>}
              {record.type === 'exchange' && <span className="text-blue-400">เปลี่ยน</span>}
            </div>
          </div>
          {record.equations.length > 0 && (
            <div className="text-[8px] lg:text-xs text-white/30 font-mono mt-0.5 truncate">{record.equations.join(' | ')}</div>
          )}
        </div>
      ))}
    </div>
  );
}
