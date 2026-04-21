"use client";

export default function BoardLegend() {
  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { color: "bg-[#c0392b]", label: "3E ×3", desc: "Triple Equation" },
          { color: "bg-[#f39c12]", label: "2E ×2", desc: "Double Equation" },
          { color: "bg-[#2980b9]", label: "3N ×3", desc: "Triple Number" },
          { color: "bg-[#e67e22]", label: "2N ×2", desc: "Double Number" },
        ].map(({ color, label, desc }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded ${color} flex-shrink-0 flex items-center justify-center text-white text-[7px] font-black`}
            >
              {label}
            </div>
            <span className="text-white/40 truncate">{desc}</span>
          </div>
        ))}
      </div>

      {/* Legend explanation */}
      <div className="bg-white/5 border border-white/10 rounded p-2">
        <p className="text-white/60 text-xs leading-relaxed">
          <span className="text-amber-400 font-bold">N</span> = Number (ตัวเลข)
          <br />
          <span className="text-amber-400 font-bold">E</span> = Equation (สมการ)
        </p>
      </div>
    </div>
  );
}
