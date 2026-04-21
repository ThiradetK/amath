'use client';
import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { TileValue } from '@/lib/types';

const ALL_VALUES: TileValue[] = [
  '0','1','2','3','4','5','6','7','8','9','10',
  '11','12','13','14','15','16','17','18','19','20',
  '+','-','×','÷','='
];

interface BlankTileDialogProps {
  tileId: string;
  onClose: () => void;
}

export default function BlankTileDialog({ tileId, onClose }: BlankTileDialogProps) {
  const { setBlankValue } = useGameStore();

  const handleSelect = (value: TileValue) => {
    setBlankValue(tileId, value);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a0c00] border border-amber-700/50 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
        <h3 className="text-amber-300 font-black text-lg mb-1">เบี้ยว่าง (Blank)</h3>
        <p className="text-white/40 text-xs mb-4">เลือกค่าที่ต้องการแทน</p>
        
        {/* Numbers */}
        <div className="mb-3">
          <p className="text-white/30 text-xs mb-2 uppercase tracking-widest">ตัวเลข</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_VALUES.filter(v => !isNaN(Number(v))).map(v => (
              <button key={v} onClick={() => handleSelect(v)}
                className="w-9 h-9 bg-[#f5e6c8] text-amber-900 font-black rounded text-sm hover:bg-amber-300 transition-all hover:scale-105">
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Operators */}
        <div className="mb-4">
          <p className="text-white/30 text-xs mb-2 uppercase tracking-widest">เครื่องหมาย</p>
          <div className="flex gap-1.5">
            {ALL_VALUES.filter(v => isNaN(Number(v))).map(v => (
              <button key={v} onClick={() => handleSelect(v)}
                className="w-9 h-9 bg-[#f5e6c8] text-amber-900 font-black rounded text-base hover:bg-amber-300 transition-all hover:scale-105">
                {v}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/60 font-bold rounded-lg text-sm transition-all">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
